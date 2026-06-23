# Pytorch Set Up

1. Make sure you have python and pip installed with version compatability here: https://pytorch.org/get-started/locally/
    - `brew install pyenv`
    - `pyenv install 3.11`
    - `pyenv global 3.11`
2. `cd` into this directory
3. Create the virtual environment: `python3 -m venv env`
4. Activate the virtual environment: `source env/bin/activate`
5. Install pytorch: `pip install -r requirements.txt`
6. `python test_pytorch.py`
7. `deactivate`

## Test GPU Usage on mac
1. Open the virtual environment
2. `python mac_pytorch.py`

If you open the Activity Monitor, you can see gpu usage spike.

## Resources
Tutorials: https://docs.pytorch.org/tutorials/