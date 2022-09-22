#!/usr/bin/env python3

import os, json, urllib.parse, re

MODELS_ROOT_DIR = 'public/models'
JSON_FILENAME = 'public/js/builtInModels.js'

URL_ROOT = MODELS_ROOT_DIR.replace('public/', '')
models_list = []
category_list = []

match_gltf = re.compile('(gltf|glb)$', re.IGNORECASE)

for category in os.listdir(MODELS_ROOT_DIR):
    category_dir = MODELS_ROOT_DIR + '/' + category
    if os.path.isdir(category_dir):
        print('Building category: ' + category)
        category_list.append(category)

        for model in os.listdir(category_dir):
            if match_gltf.search(model) != None:
                print('  Adding: ' + model)
                model = {
                    'url': URL_ROOT + '/' + category + '/' + model,
                    'category': category
                }
                models_list.append(model)

category_list.sort()

def compare_model(ele):
    return os.path.basename(ele['url']).lower()

models_list.sort(key=compare_model)

out_string = 'BUILT_IN_MODELS_CATEGORIES = ' + json.dumps(category_list) + ';'
out_string += 'BUILT_IN_MODELS = ' + json.dumps(models_list) + ';'

json_file = open(JSON_FILENAME, 'w')
json_file.write(out_string)