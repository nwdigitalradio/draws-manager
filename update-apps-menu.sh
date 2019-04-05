# Requires csvtojson - sudo npm i -g csvtojson

csvtojson draws-apps.csv | json_pp -f json -json_opt pretty | tee webapp/draws-apps.json 

