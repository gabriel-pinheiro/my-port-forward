LINUX_BIN=https://cdn.codetunnel.net/mpf/mpf-linux
MACOS_BIN=https://cdn.codetunnel.net/mpf/mpf-macos

# Verify that a command is installed
verify_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Error: $1 is not installed. Please install it and try again." 1>&2
        exit 1
    fi
}

verify_command "curl"
verify_command "kubectl"

# Verify root
if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root, retry with sudo" 1>&2
    exit 1
fi

# Download binary
if [ "$(uname)" = "Darwin" ]; then
    echo "Downloading MacOS binary..."
    curl -s -o /usr/local/bin/mpf "$MACOS_BIN"
else
    echo "Downloading Linux binary..."
    curl -s -o /usr/local/bin/mpf "$LINUX_BIN"
fi

# Executable permissions
echo "Setting executable permissions..."
chmod +x /usr/local/bin/mpf

# Success message
echo "My Port Forward is successfully installed! Versions:"
mpf --version

echo "\n\e[1;2m$ \e[0mmpf --help"
mpf --help
