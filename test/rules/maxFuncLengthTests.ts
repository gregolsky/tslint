/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {RuleFailure, TestUtils} from "../lint";

describe.only("<max-func-body-length, 10>", () => {
    const MaxFuncBodyLengthRule = TestUtils.getRule("max-func-body-length");
    const fileName = "rules/max-func-body-length.test.ts";
    const failureString = MaxFuncBodyLengthRule.FAILURE_STRING;

    it("forbids the use of undefined labels", () => {
        const expectedFailures: RuleFailure[] = [
            TestUtils.createFailure(fileName, [6, 9], [6, 14], failureString + "lab1'"),
        ];
        const actualFailures = TestUtils.applyRuleOnFile(fileName, MaxFuncBodyLengthRule);

        TestUtils.assertFailuresEqual(actualFailures, expectedFailures);
    });
});
