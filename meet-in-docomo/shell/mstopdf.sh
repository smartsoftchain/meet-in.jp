#!/bin/sh

export HOME=/var/www/html/public/cmn-data/
timeout -s 9 300 sudo /usr/bin/libreoffice --headless --nologo --nofirststartwizard --convert-to pdf:writer_pdf_Export --outdir /var/www/html/public/cmn-data $1 2>&1
