#!/usr/bin/env python3

import os, re, hashlib

LOG_LEVEL = 1
SCAN_DIRS = ['', 'js']
SCRIPT_PATH = os.path.realpath(__file__)
BASE_DIR = os.path.split(SCRIPT_PATH)[0] + '/public'

LOG_ERROR = 0
LOG_INFO = 1
LOG_DEBUG = 2

hash_cache = {}

def log(level, text):
  if LOG_LEVEL >= level:
    print(text)

def get_hash(url):
  filename = url.split('?')[0][1:]
  if filename in hash_cache:
    log(LOG_DEBUG, '      Hash Cache (' + filename + '): ' + hash_cache[filename])
    return hash_cache[filename]

  f = open(os.path.join(BASE_DIR, filename), 'rb')
  m = hashlib.md5()
  m.update(f.read())
  hash = m.hexdigest()[:8]
  hash_cache[filename] = hash

  log(LOG_DEBUG, '      Hash (' + filename + '): ' + hash)
  return hash

def replace_path(url):
  regex = re.compile('v=[0-9a-f]+')
  parts = regex.split(url)

  return parts[0] + 'v=' + get_hash(url) + parts[1]

def scan_file(full_path):
  regex = re.compile('["\'][^"\']+v=[0-9a-f]+["\']')
  f = open(full_path, 'r')
  infile = f.read()
  outfile = ''
  start = 0
  while True:
    match = regex.search(infile, start)
    if match == None:
      outfile += infile[start:]
      break
    log(LOG_DEBUG, '    Match found: ' + match.group())
    outfile += infile[start:match.start()]
    outfile += replace_path(match.group())
    start = match.end()
  if outfile != infile:
    log(LOG_INFO, '    File changed: ' + full_path)
    f_out = open(full_path, 'w')
    f_out.write(outfile)
    f_out.close()

def scan_directory(directory):
  for name in os.listdir(directory):
    full_path = os.path.join(directory, name)
    if os.path.isfile(full_path) and (full_path[-3:] == '.js' or full_path[-5:] == '.html'):
      log(LOG_DEBUG, '  File: ' + full_path)
      scan_file(full_path)

def main():
  log(LOG_DEBUG, 'Base directory: ' + BASE_DIR)
  for scan in SCAN_DIRS:
    directory = os.path.join(BASE_DIR, scan)
    log(LOG_INFO, 'Scanning ' + directory)
    scan_directory(directory)

main()