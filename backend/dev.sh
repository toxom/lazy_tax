#!/bin/bash
# Local dev server: http://127.0.0.1:8090 (admin UI at /_/)
# PB_DEV=1 prints email OTP codes to this terminal instead of sending email.
cd "$(dirname "$0")"
PB_DEV=1 ./pocketbase serve --dev
