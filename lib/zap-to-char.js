'use babel';

import InputDialog from "./input-dialog";
import { Point, Range, CompositeDisposable } from 'atom';

export default {

        maxRange: 140,
        subscriptions: null,

        activate(state) {
                // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
                this.subscriptions = new CompositeDisposable();

                // Register command that toggles this view
                this.subscriptions.add(atom.commands.add('atom-workspace', {
                        'zap-to-char:zap-to-char': () => this.zapToChar()
                }));
        },

        zapToChar() {
		let editor = atom.workspace.getActiveTextEditor();
		let range = editor.getSelectedBufferRange();
		let buffer = editor.getBuffer();
		let nextPoint = range.end.traverse(new Point(0, this.maxRange));
		let nextCharRange = new Range(range.end, nextPoint);
		let searchText = buffer.getTextInRange(nextCharRange);

                let dialog = new InputDialog({
                        labelText: "Zap to char:",
                        callback: (toText) => {
                                let pos = searchText.indexOf(toText);
                                if (pos < 0) {
                                        this.focusBack(editor);
                                        return;
                                }

                                let killText = searchText.substr(0, pos + toText.length);
                                atom.clipboard.write(killText);

                                let deleteToPoint = range.end.traverse(new Point(0, pos + toText.length));
                                let deleteRange = new Range(range.end, deleteToPoint);
                                buffer.delete(deleteRange);

                                this.focusBack(editor);
                        }
                });
                dialog.attach();
        },

        focusBack(editor) {
                // Focus back on the editor
                editor.element.focus();
                editor.scrollToCursorPosition();
        },

};
