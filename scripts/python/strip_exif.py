import os
import pathlib
import subprocess


from repo import repo_root


def get_photos_dir(root):
    photos_dir = pathlib.Path(root, 'assets/images/photography')
    assert photos_dir.exists
    return photos_dir


if __name__ == '__main__':
    root = pathlib.Path(repo_root())
    photos = str(get_photos_dir(root))

    # Strip all EXIF data
    subprocess.run(['exiftool', '-r', '-overwrite_original', '-all=', photos])
