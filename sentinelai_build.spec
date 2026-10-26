# sentinelai_build.spec — PyInstaller build configuration
# Run: pyinstaller sentinelai_build.spec

import sys, os

BASE = os.path.dirname(os.path.abspath(SPEC))  # noqa
CORE = os.path.join(BASE, 'src', 'core')

# ── Collect data files ────────────────────────────────────────────────────────
datas = []
model = os.path.join(BASE, 'src', 'ml', 'models', 'brain_model.pkl')
if os.path.exists(model):
    datas.append((model, 'models'))
for cfg in [os.path.join(BASE, 'config')]:
    if os.path.exists(cfg):
        datas.append((cfg, 'config'))

# ── Hidden imports ────────────────────────────────────────────────────────────
hiddenimports = [
    'pefile', 'psutil', 'joblib', 'requests', 'plyer',
    'plyer.platforms.win.notification',
    'pystray', '_pystray_backend_win32',
    'PIL', 'PIL.Image', 'PIL.ImageDraw',
    'sklearn', 'sklearn.ensemble', 'sklearn.tree',
    'sklearn.preprocessing', 'sklearn.utils._cython_blas',
    'sklearn.neighbors._typedefs',
    'flask', 'flask_cors',
    'win32api', 'win32con', 'win32security', 'winerror',
    'ctypes', 'ctypes.wintypes', 'ctypes.windll',
    'hashlib', 'winreg', 'threading', 'subprocess',
]

a = Analysis(  # noqa
    [os.path.join(BASE, 'main.py')],
    pathex=[CORE, BASE],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'notebook', 'pytest', 'IPython'],
    noarchive=False,
)

pyz = PYZ(a.pure)  # noqa

exe = EXE(  # noqa
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='SentinelAI',
    debug=False,
    strip=False,
    upx=True,
    console=False,      # No console window — runs silently in background
    uac_admin=True,     # Requests UAC elevation automatically
)

coll = COLLECT(  # noqa
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    name='SentinelAI',
)
