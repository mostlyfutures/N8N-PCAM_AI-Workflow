# Platform Usage Quick Start

Choose your platform below to get started with PCAMAW CLI:

---

## 🍎 macOS

### Installation
```bash
cd pcamaw-cli
npm install
chmod +x bin/pcamaw.js
npm link
```

### Usage
```bash
pcamaw list
pcamaw show my-patch
pcamaw apply my-patch
```

### VS Code Setup
1. Open VS Code
2. `Cmd+Shift+P`
3. Type: "Shell Command: Install 'code' command in PATH"
4. Execute

### Verify
```bash
which code      # /usr/local/bin/code
pcamaw --version  # 0.1.0
```

---

## 🪟 Windows

### Installation (PowerShell - Run as Administrator)
```powershell
cd pcamaw-cli
npm install
npm link
```

### Usage (After global link)
```powershell
pcamaw list
pcamaw show my-patch
pcamaw apply my-patch
```

### Usage (Without global link)
```cmd
node bin\pcamaw.js list
node bin\pcamaw.js show my-patch
node bin\pcamaw.js apply my-patch
```

### VS Code Setup
Usually automatic. If `code` command not found:
1. Reinstall VS Code
2. Check "Add to PATH" during installation
3. Or add manually: `C:\Program Files\Microsoft VS Code\bin`

### Fix PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Verify
```powershell
Get-Command code    # Should show VS Code path
pcamaw --version    # 0.1.0
```

---

## 🐧 Linux

### Installation
```bash
cd pcamaw-cli
npm install
chmod +x bin/pcamaw.js
sudo npm link
```

### Usage
```bash
pcamaw list
pcamaw show my-patch
pcamaw apply my-patch
```

### VS Code Setup (Debian/Ubuntu)
```bash
sudo update-alternatives --install /usr/bin/code code /usr/share/code/bin/code 100
```

### VS Code Setup (Manual PATH)
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export PATH="$PATH:/usr/share/code/bin"
```
Then: `source ~/.bashrc`

### Alternative: Symlink
```bash
sudo ln -s /full/path/to/pcamaw-cli/bin/pcamaw.js /usr/local/bin/pcamaw
```

### Verify
```bash
which code        # /usr/bin/code or /usr/share/code/bin/code
which pcamaw      # /usr/local/bin/pcamaw
pcamaw --version  # 0.1.0
```

---

## Common Commands (All Platforms)

```bash
# List patches
pcamaw list

# Show patch details
pcamaw show <name>

# Open in VS Code
pcamaw open <name>

# Apply patch (interactive)
pcamaw apply <name>

# Apply and auto-push
pcamaw apply <name> --auto-push

# Stage files as patch
pcamaw stage file1.js file2.js --name "my-patch" --description "Changes"

# Clear all patches
pcamaw clear --force
```

---

## Platform Differences Summary

| Feature | macOS | Windows | Linux |
|---------|-------|---------|-------|
| **Executable** | `chmod +x` needed | Not needed | `chmod +x` needed |
| **Global install** | `npm link` | `npm link` (as Admin) | `sudo npm link` |
| **Path separator** | `/` | `\` or `/` | `/` |
| **Line continuation** | `\` | `` ` `` (PS) or `^` (CMD) | `\` |
| **VS Code path** | `/usr/local/bin/code` | `C:\Program Files\...\code.exe` | `/usr/bin/code` |
| **Direct usage** | `./bin/pcamaw.js` | `node bin\pcamaw.js` | `./bin/pcamaw.js` |

---

## Troubleshooting

### "Command not found: pcamaw"
- **macOS/Linux:** Run `npm link` or use `./bin/pcamaw.js`
- **Windows:** Run `npm link` as Administrator or use `node bin\pcamaw.js`

### "VS Code doesn't open"
- **macOS:** Install via `Cmd+Shift+P` → "Install 'code' command"
- **Windows:** Reinstall VS Code with "Add to PATH" checked
- **Linux:** Add `/usr/share/code/bin` to PATH

### "Cannot load module"
- All platforms: Run `npm install` in `pcamaw-cli` directory

---

## File Paths Examples

### macOS/Linux
```bash
pcamaw stage src/auth.js lib/utils.js --name "my-patch"
```

### Windows (PowerShell - preferred)
```powershell
pcamaw stage src/auth.js lib/utils.js --name "my-patch"
```

### Windows (CMD)
```cmd
pcamaw stage src\auth.js lib\utils.js --name "my-patch"
```

---

## Need Help?

See the full [README.md](./README.md) for:
- Detailed installation steps
- Command reference
- Advanced usage
- Complete troubleshooting guide
