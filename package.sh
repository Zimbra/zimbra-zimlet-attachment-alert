#!/bin/bash

npm install
zimlet build
zimlet package -v 0.0.2 --zimbraXVersion ">=2.0.0" -n "zimbra-zimlet-attachment-alert" --desc "Alerts you when forgetting to attach an attachment when sending an email." -l "Attachment Alert Zimlet"
