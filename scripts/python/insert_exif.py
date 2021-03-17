import os
import pathlib
import re

from argparse import ArgumentParser

import exiftool

from mdutils.fileutils.fileutils import MarkDownFile

from repo import repo_root


def find_post(posts_dir, post_name):
    post_name = ''.join(['*', post_name, '*'])
    post = list(posts_dir.glob(post_name))

    if not post:
        print('No posts matching {} were found.'.format(post_name))
        raise SystemExit

    if len(post) > 1:
        print('Multiple posts found matching parameter.')
        raise SystemExit

    return post.pop()


def format_post(contents):
    if not contents[0] == '---':
        contents.insert(0, '---')
    return contents


def insert_exif(contents, image_path):
    with exiftool.ExifTool() as et:
        exif_metadata = et.get_metadata(str(image_path))

    tags = {
        'make': [
            'EXIF:Make'
        ],
        'model': [
            'EXIF:Model'
        ],
        'lens': [
            'EXIF:LensModel'
        ],
        'iso': [
            'EXIF:ISO'
        ],
        'capture_date': [
            'EXIF:DateTimeOriginal',
            'IPTC:DateCreated'
        ]
    }

    insert_index = get_insert_index('---', contents)

    for post_tag, metadata in tags.items():
        for m in metadata:    
            try:
                data = exif_metadata[m]
            except KeyError:
                print(f"Key {post_tag} was not found.")
                continue
            break

        if 'capture_date' in post_tag:
            data = data.replace(':', '-')
            data = data.split(' ')[0]

        contents.insert(insert_index, ': '.join([post_tag, str(data)]))

    if get_delimiter_count(contents) < 2:
        contents.append('---')

    return contents


def get_insert_index(criteria, contents):
    return contents[::-1].index(criteria)


def get_delimiter_count(contents):
    return contents.count('---')


def load_post_contents(post):
    return MarkDownFile().read_file(str(post)).split('\n')


def write_post_contents(post, contents):
    mdf = MarkDownFile(str(post))
    mdf.rewrite_all_file('\n'.join(contents))


def get_image_path_from_post(contents):
    for item in contents:
        if 'image:' in item:
            image_file = pathlib.Path(item.lstrip('image:').lstrip())
            assert image_file.exists

            return image_file

    print('No image tag found!')
    raise SystemExit


def parse_args():
    parser = ArgumentParser()
    parser.add_argument('post_name', nargs='?',
                        help='Post name to insert EXIF for.')

    return parser.parse_args()


def main():
    args = parse_args()

    post = find_post(pathlib.Path(repo_root(), '_posts'), args.post_name)
    contents = load_post_contents(post)
    image_path = get_image_path_from_post(contents)

    contents = insert_exif(contents, image_path)
    contents = format_post(contents)
    contents = list(filter(None, contents))

    print(contents)
    if not contents.count('---') == 2:
        print('Unexpected number of delimiters in post.')
        raise SystemExit

    # if contents:
    #     write_post_contents(post, contents)
    # else:
    #     print('Unexpected end of post.')
    #     raise SystemExit

if __name__ == '__main__':
    main()
