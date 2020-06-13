#!/bin/bash

pushd scss
sass --sourcemap=none --watch .:../public/css
popd