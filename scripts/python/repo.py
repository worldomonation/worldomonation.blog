import os
import pathlib

import git


def repo_root():
    repo = git.Repo(os.path.curdir, search_parent_directories=True)
    return repo.git.rev_parse("--show-toplevel")
