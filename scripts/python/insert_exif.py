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


def insert_exif(contents, image_path):
    with exiftool.ExifTool() as et:
        metadata = et.get_metadata(str(image_path))

    tags = [
        ('make', 'EXIF:Make'),
        ('model', 'EXIF:Model'),
        ('lens', 'EXIF:LensModel'),
        ('iso', 'EXIF:ISO'),
        ('capture_date', 'IPTC:DateCreated'),
    ]
    for post_tag, metadata_tag in tags:
        data = metadata[metadata_tag]

        if 'capture_date' in post_tag:
            data = data.replace(':', '-')

        contents.append(': '.join([post_tag, str(data)]))

    contents.append('---')
    return contents


def load_post_contents(post):
    return MarkDownFile().read_file(str(post)).split('\n')


def write_post_contents(post, contents):
    mdf = MarkDownFile(str(post))
    mdf.rewrite_all_file('\n'.join(contents))


def extract_image_path(contents):
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
                        help='Post to insert EXIF for.')

    return parser.parse_args()


def main():
    args = parse_args()

    post = find_post(pathlib.Path(repo_root(), '_posts'), args.post_name)
    contents = load_post_contents(post)
    image_path = extract_image_path(contents)

    updated_contents = insert_exif(contents, image_path)
    write_post_contents(post, updated_contents)


if __name__ == '__main__':
    main()
