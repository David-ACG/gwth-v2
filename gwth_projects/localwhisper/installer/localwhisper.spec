# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for LocalWhisper — CPU-only, SenseVoice default.

Build command:
    pyinstaller installer/localwhisper.spec

Output: dist/localwhisper/localwhisper.exe (onedir mode)
"""

import os
import sys
from pathlib import Path

block_cipher = None

# Project root (one level up from this spec file)
ROOT = Path(SPECPATH).parent

a = Analysis(
    [str(ROOT / 'src' / 'localwhisper' / 'app.py')],
    pathex=[str(ROOT / 'src')],
    binaries=[],
    datas=[
        # Read-only assets bundled into _MEIPASS
        (str(ROOT / 'assets'), 'assets'),
        (str(ROOT / 'config' / 'default.toml'), 'config'),
        (str(ROOT / 'src' / 'localwhisper' / 'web' / 'templates'), 'localwhisper/web/templates'),
        (str(ROOT / 'src' / 'localwhisper' / 'web' / 'static'), 'localwhisper/web/static'),
    ],
    hiddenimports=[
        # Core app dependencies
        'keyboard',
        'sounddevice',
        'pystray',
        'PIL',
        'PIL.Image',
        'uvicorn',
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'fastapi',
        'starlette',
        'starlette.responses',
        'jinja2',

        # SenseVoice / funasr dependencies
        'funasr',
        'funasr.auto',
        'funasr.models',
        'torch',
        'torchaudio',
        'scipy',
        'scipy.signal',
        'librosa',
        'soundfile',

        # Standard library modules that may be missed
        'tomllib',
        'multiprocessing',
        'sqlite3',

        # Encodings needed at runtime
        'encodings',
        'encodings.utf_8',
        'encodings.ascii',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Large unused packages — exclude to keep bundle small
        'matplotlib',
        'matplotlib.pyplot',
        'IPython',
        'notebook',
        'jupyter',
        'tensorboard',
        'triton',
        'torch.distributed',
        'torch.testing',
        'torch.utils.tensorboard',

        # CUDA/GPU packages — CPU-only build
        'nvidia',
        'nvidia.cublas',
        'nvidia.cuda_runtime',
        'nvidia.cudnn',
        'nvidia.cufft',
        'nvidia.curand',
        'nvidia.cusolver',
        'nvidia.cusparse',
        'nvidia.nccl',
        'nvidia.nvjitlink',
        'nvidia.nvtx',

        # Testing
        'pytest',
        'pytest_asyncio',
        '_pytest',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='localwhisper',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,  # No terminal window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=str(ROOT / 'assets' / 'icon_idle.ico'),
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='localwhisper',
)
