# Copyright 2014 Palantir Technologies, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

num_failures=0

expectOut () {
  actual=$1
  expect=$2
  msg=$3

  nodeV=`node -v`
  
  # if Node 0.10.*, node will sometimes exit with status 8 when an error is thrown
  if [[ $expect != $actual || $nodeV == v0.10.* && $expect == 1 && $actual == 8 ]] ; then
    echo "$msg: expected $expect got $actual"
    num_failures=$(expr $num_failures + 1)
  fi
}

echo "Checking tslint binary"
# make sure calling tslint with no args exits correctly.
./bin/tslint
expectOut $? 1  "tslint with no args did not exit correctly"

# make sure calling tslint with a good file exits correctly.
./bin/tslint src/configuration.ts
expectOut $? 0 "tslint with a good file did not exit correctly"

# make sure calling tslint without the -f flag exits correctly
./bin/tslint src/configuration.ts src/formatterLoader.ts
expectOut $? 0 "tslint with valid arguments did not exit correctly"

# make sure calling tslint with the -f flag exits correctly
./bin/tslint src/configuration.ts -f src/formatterLoader.ts
expectOut $? 1 "tslint with -f flag did not exit correctly"

# make sure calling tslint with a CLI custom rules directory that doesn't exist fails
# (redirect stderr because it's confusing to see a stack trace during the build)
./bin/tslint -c ./test/config/tslint-custom-rules.json -r ./someRandomDir src/tslint.ts
expectOut $? 1 "tslint with -r pointing to a nonexistent directory did not fail"

# make sure calling tslint with a CLI custom rules directory that does exist finds the errors it should
./bin/tslint -c ./test/config/tslint-custom-rules.json -r ./test/files/custom-rules src/tslint.ts
expectOut $? 2 "tslint with with -r pointing to custom rules did not find lint failures"

# make sure calling tslint with a rulesDirectory in a config file works
./bin/tslint -c ./test/config/tslint-custom-rules-with-dir.json src/tslint.ts
expectOut $? 2 "tslint with with JSON pointing to custom rules did not find lint failures"



# make sure tslint --init generates a file
cd ./bin
if [ -f tslint.json ]; then
  rm tslint.json
fi

./tslint --init
if [ ! -f tslint.json ]; then
  echo "--init failed, tslint.json not created"
  num_failures=$(expr $num_failures + 1)
fi
expectOut $? 0 "tslint with --init flag did not exit correctly"

# should fail since tslint.json already exists
./tslint --init
expectOut $? 1 "tslint with --init flag did not exit correctly when tslint.json already exists"

rm tslint.json
cd ..

if [ $num_failures != 0 ]; then
  echo "Failed $num_failures tests"
  exit 1
else
  echo "Done!"
  exit 0
fi
