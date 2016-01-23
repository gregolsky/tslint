/**
 * @license
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

/// <reference path="../../typings/node/node.d.ts"/>

import * as ts from "typescript";
import * as Lint from "../lint";

const FUNC_LENGTH_OPTION = 'FUNC_BODY_LENGTH_OPTION';

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "function too long";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new FunctionBodyTooLongWalker(sourceFile, this.getOptions()));
    }
}

class FunctionInfo {
    declaration: ts.Node;
    braceOpen: ts.Node;
    braceClose: ts.Node;

    constructor (declarationNode: ts.Node) {
        this.declaration = declarationNode;
    }

}

class FunctionBodyTooLongWalker extends Lint.RuleWalker {

    private maxFuncBodyLength: number;
    private startNodes: ts.Node[] = [];
    private functions: FunctionInfo[] = [];
    private stack: FunctionInfo[] = [];
    private nonFunctionBraceCounter: number = 0;

    private get isFunctionBrace () {
        return this.nonFunctionBraceCounter === 0;
    }

    private get currentFunctionInfo () {
        if (!this.stack.length) {
            return null;
        }

        return this.stack[this.stack.length - 1];
    }

    constructor(sourceFile: ts.SourceFile, options: Lint.IOptions) {
        super(sourceFile, options);

        if (this.hasOption(FUNC_LENGTH_OPTION)) {
            this.maxFuncBodyLength = this.getOptions()[FUNC_LENGTH_OPTION];
        }
    }

    public visitNode(node: ts.Node) {
        if (!node) {
            return;
        }
        
        if (!this.maxFuncBodyLength) {
            return;
        }

        let kind = node.kind;
        debugger;
        if (kind === ts.SyntaxKind.FunctionDeclaration ||
            kind === ts.SyntaxKind.MethodDeclaration) {
            this.handleFunctionDeclaration(node);
        } else if (kind === ts.SyntaxKind.OpenBraceToken) {
            this.handleBraceOpen(node);
        } else if (kind === ts.SyntaxKind.CloseBraceToken) {
            this.handleBraceClosed(node);
        }

        super.visitNode(node);
    }

    private handleFunctionDeclaration (node: ts.Node) {
        let idx = this.startNodes.length;
        this.startNodes.push(node);
        let func = new FunctionInfo(node);
        this.functions.push(func);
        this.stack.push(func);
    }

    private handleBraceOpen (node: ts.Node) {
        let func = this.currentFunctionInfo;
        if (!func ||
            func.braceOpen) {
                this.isFunctionBrace = false;
            return;
        }

        func.braceOpen = node;
    }

    private handleBraceClosed (node: ts.Node) {
        if (!this.isFunctionBrace) {
            this.nonFunctionBraceCounter--;
            return;
        }

        let func = this.functions.pop();
        this.addFuncBodyTooLongFailure(func);
    }

    private addFuncBodyTooLongFailure(funcInfo: FunctionInfo) {
        let node = funcInfo.declaration;
        let failure = this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING);
        this.addFailure(failure);
    }
}
