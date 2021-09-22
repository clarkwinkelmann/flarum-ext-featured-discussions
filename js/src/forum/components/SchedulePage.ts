import {Vnode} from 'mithril';
import {Dayjs} from 'dayjs';
import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import IndexPage from 'flarum/forum/components/IndexPage';
import listItems from 'flarum/common/helpers/listItems';
import Discussion from 'flarum/common/models/Discussion';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';

function dragDiscussionSlug(event: DragEvent): string | null {
    if (!event.dataTransfer) {
        return null;
    }

    let url = event.dataTransfer.getData('URL');

    if (!url) {
        url = event.dataTransfer.getData('text/plain');
    }

    // We won't match the URL from the start because there will be both path-only and fully qualified URLs
    const regex = new RegExp(app.route('discussion', {
        id: '==id==',
    }).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('==id==', '([^/]+)') + '(/[0-9]+)?$');

    const matches = regex.exec(url);

    if (!matches) {
        return null;
    }

    return matches[1];
}

// We don't check whether the link is to a discussion here because it's not available until the user drops it when
// coming from a different window
// text/uri-list is the official type that handles most drags inside the tab or cross browser tabs
// text/x-moz-url is necessary to receive drops from Firefox address bar, or in Firefox from cross browser
function isLink(event: DragEvent): boolean {
    if (!event.dataTransfer) {
        return false;
    }

    return event.dataTransfer.types.includes('text/uri-list') ||
        event.dataTransfer.types.includes('text/x-moz-url');
}

function ondragover(this: HTMLElement, event: DragEvent) {
    if (!event.dataTransfer) {
        return;
    }

    if (!isLink(event)) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    // @ts-ignore Mithril event redraw
    event.redraw = false;

    this.classList.add('valid-drop');
}

export default class SchedulePage extends Page {
    oninit(vnode: Vnode) {
        super.oninit(vnode);

        app.store.find('discussions', {
            filter: {
                featureScheduled: 1,
            },
            page: {
                limit: 50,
            },
        }).then(() => {
            // We don't store the discussions here, we will read them from the store
            m.redraw();
        });
    }

    view() {
        const schedule: {
            custom: boolean
            date: Dayjs
            discussions: Discussion[]
        }[] = [];

        const dates: string[] = app.forum.attribute('featureDiscussionsSchedule') || [];

        dates.forEach(date => {
            schedule.push({
                custom: false,
                date: dayjs(date),
                discussions: [],
            });
        });

        // Retrieving discussions from the store is the easiest, that way we don't need to worry about removing featured discussions
        // that were un-featured from the modal, and we don't need to explicitly add new discussions retrieved async after a drag and drop
        app.store.all('discussions').forEach((discussion: Discussion) => {
            const from = discussion.attribute('featuredFrom');

            if (!from) {
                return;
            }

            const discussionDate: any = dayjs(discussion.attribute('featuredFrom'));

            schedule.some((s, i) => {
                if (s.date.isSame(discussionDate)) {
                    s.discussions.push(discussion);

                    return true;
                }

                if (i > 0 && s.date.isAfter(discussionDate)) {
                    schedule.splice(i - 1, 0, {
                        custom: true,
                        date: discussionDate,
                        discussions: [
                            discussion,
                        ],
                    });

                    return true;
                }

                return false;
            });
        });

        return m('.container', m('.sideNavContainer', [
            m('nav.IndexPage-nav.sideNav', m('ul', listItems(IndexPage.prototype.sidebarItems().toArray()))),
            m('.sideNavOffset', [
                m('p', app.translator.trans('clarkwinkelmann-featured-discussions.forum.schedule.help')),
                m('.FeaturedScheduleList', schedule.map(s => m('.FeaturedScheduleSlot', [
                    m('.FeaturedScheduleDate', [
                        s.custom ? [
                            m('span.FeaturedScheduleCustom', '[' + app.translator.trans('clarkwinkelmann-featured-discussions.forum.schedule.custom') + ']'),
                            ' ',
                        ] : null,
                        s.date.format('YYYY-MM-DD HH:mm:ss') + ' ',
                        m('em', '(' + s.date.fromNow() + ')'),
                    ]),
                    m('.FeaturedScheduleDrop', {
                        ondragover,
                        ondragenter: ondragover,
                        ondragleave(this: HTMLElement) {
                            this.classList.remove('valid-drop');
                        },
                        ondrop(this: HTMLElement, event: DragEvent) {
                            if (!event.dataTransfer) {
                                return;
                            }

                            if (!isLink(event)) {
                                return;
                            }

                            const slug = dragDiscussionSlug(event);

                            event.preventDefault();
                            event.stopPropagation();

                            this.classList.remove('valid-drop');

                            const showError = () => {
                                this.classList.add('invalid-drop');

                                setTimeout(() => {
                                    this.classList.remove('invalid-drop');
                                }, 2000);
                            };

                            // If the link is invalid, we still prevent the drop because otherwise it would be confusing
                            // to show active drop and then let the browser load the link
                            if (!slug) {
                                showError();

                                return;
                            }

                            const discussion: Discussion = app.store.getBy('discussions', 'slug', slug);

                            const saveAttributes = {
                                featuredFrom: s.date.toISOString(),
                            };

                            if (discussion) {
                                discussion.save(saveAttributes).then(() => {
                                    m.redraw();
                                });
                            } else {
                                // If the discussion was dropped from another window, we need to retrieve it from the store
                                app.store.find('discussions', slug, {
                                    bySlug: true,
                                    // Similar includes as the discussion list, that way the template should be mostly OK
                                    // If extensions customize the includes on homepage it unfortunately won't reflect here
                                    // this means tags aren't loaded at the moment, and mostRelevantPost isn't available
                                    include: 'user,lastPostedUser',
                                }).then((discussion: Discussion) => {
                                    discussion.save(saveAttributes).then(() => {
                                        m.redraw();
                                    });
                                }).catch(error => {
                                    showError();

                                    throw error;
                                });
                            }
                        },
                    }, [
                        m('.FeaturedScheduleDropHere', app.translator.trans('clarkwinkelmann-featured-discussions.forum.schedule.drop-here')),
                        m('.FeaturedScheduleDropError', app.translator.trans('clarkwinkelmann-featured-discussions.forum.schedule.drop-error')),
                        s.discussions.length === 0 ? m('.FeaturedScheduleDropEmpty', app.translator.trans('clarkwinkelmann-featured-discussions.forum.schedule.empty')) : null,
                        s.discussions.map(discussion => m('.FeaturedScheduleDiscussion', {
                            draggable: true,
                            ondragstart(this: HTMLElement, event: DragEvent) {
                                if (!event.dataTransfer) {
                                    return;
                                }

                                const position = this.getBoundingClientRect();

                                const url = app.forum.attribute('baseUrl') + app.route.discussion(discussion);

                                event.dataTransfer.effectAllowed = 'move';
                                event.dataTransfer.setData('text/uri-list', url);
                                event.dataTransfer.setData('text/plain', url);
                                event.dataTransfer.setDragImage(this, event.pageX - position.left - window.scrollX, event.pageY - position.top - window.scrollY);
                            },
                        }, DiscussionListItem.component({
                            discussion,
                            params: {},
                        }))),
                    ]),
                ]))),
            ]),
        ]));
    }
}
