browserify = require 'browserify'
child = require 'child_process'
fs = require 'fs'

task 'package', 'Package javascript into a deployable file', ->
  console.log 'Tar/gzing...'
  child.exec 'cp -R lib build/package; cp package.json build/package; cd build; tar -czf ../http-browserify.tar.gz package'
