import os
import pathlib
import subprocess

import git


def get_photos_dir(root):
    photos_dir = pathlib.Path(root, 'assets/images/photography')
    assert photos_dir.exists
    return photos_dir


def _repo_root():
    repo = git.Repo(os.path.curdir, search_parent_directories=True)
    return repo.git.rev_parse("--show-toplevel")


if __name__ == '__main__':
    root = pathlib.Path(_repo_root())
    photos = str(get_photos_dir(root))

    # Strip all EXIF data
    subprocess.run(['exiftool', '-r', 'overwrite_original', '-all=', photos])

