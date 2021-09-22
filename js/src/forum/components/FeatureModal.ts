import {Vnode} from 'mithril';
import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';
import Discussion from 'flarum/common/models/Discussion';

interface FeatureModalAttrs {
    discussion: Discussion
}

// @ts-ignore TODO missing Modal.view typings
export default class FeatureModal extends Modal {
    attrs!: FeatureModalAttrs

    from: string | null = null
    until: string | null = null

    oninit(vnode: Vnode) {
        super.oninit(vnode);

        this.from = this.attrs.discussion.attribute('featuredFrom') || null;
        this.until = this.attrs.discussion.attribute('featuredUntilEdit') || null;
    }

    className() {
        return 'FeatureModal';
    }

    title() {
        return app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.title');
    }

    content() {
        return m('.Modal-body', [
            m('.Form-group', [
                m('label', app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.fields.from')),
                m('label', [
                    m('input', {
                        type: 'radio',
                        name: 'featuredFrom',
                        value: 'off',
                        checked: this.from === null,
                        onchange: () => {
                            this.from = null;
                            this.until = null;
                        },
                    }),
                    ' ',
                    app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.from.not'),
                ]),
                m('label', [
                    m('input', {
                        type: 'radio',
                        name: 'featuredFrom',
                        value: 'next',
                        checked: this.from === 'next',
                        onchange: () => {
                            this.from = 'next';
                        },
                    }),
                    ' ',
                    app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.from.next'),
                ]),
                m('label', [
                    m('input', {
                        type: 'radio',
                        name: 'featuredFrom',
                        value: 'manual',
                        checked: this.from !== null && this.from !== 'next',
                        onchange: () => {
                            this.from = '';

                            setTimeout(() => {
                                this.$('input.js-featured-from').focus();
                            }, 0);
                        },
                    }),
                    ' ',
                    app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.from.manual'),
                    m('input.FormControl.js-featured-from', {
                        type: 'text',
                        value: this.from !== 'next' ? this.from : '',
                        onchange: (event: Event) => {
                            this.from = (event.target as HTMLInputElement).value;
                        },
                        disabled: this.from === null || this.from === 'next',
                    }),
                ]),
            ]),
            m('.Form-group', [
                m('label', app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.fields.until')),
                m('label', [
                    m('input', {
                        type: 'radio',
                        name: 'featuredUntil',
                        value: 'auto',
                        checked: this.until === null,
                        onchange: () => {
                            this.until = null;
                        },
                    }),
                    ' ',
                    app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.until.auto'),
                ]),
                m('label', [
                    m('input', {
                        type: 'radio',
                        name: 'featuredUntil',
                        value: 'manual',
                        checked: this.until !== null,
                        onchange: () => {
                            this.until = '';

                            setTimeout(() => {
                                this.$('input.js-featured-until').focus();
                            }, 0);
                        },
                    }),
                    ' ',
                    app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.until.manual'),
                    m('input.FormControl.js-featured-until', {
                        type: 'text',
                        value: this.until,
                        onchange: (event: Event) => {
                            this.until = (event.target as HTMLInputElement).value;
                        },
                        disabled: this.until === null,
                    }),
                ]),
            ]),
            m('.Form-group', [
                Button.component({
                    className: 'Button',
                    onclick() {
                        app.modal.close();
                    },
                }, app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.action.cancel')),
                ' ',
                Button.component({
                    type: 'submit',
                    className: 'Button Button--primary',
                }, app.translator.trans('clarkwinkelmann-featured-discussions.forum.modal.action.submit')),
            ]),
        ]);
    }

    onsubmit(event: Event) {
        event.preventDefault();

        this.loading = true;

        this.attrs.discussion.save({
            featuredFrom: this.from,
            featuredUntil: this.until,
        }).then(() => {
            this.loading = false;

            app.modal.close();
        }, this.loaded);
    }
}
