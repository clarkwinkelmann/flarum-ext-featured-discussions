import app from 'flarum/forum/app';
import EventPost from 'flarum/forum/components/EventPost';

function formatDate(date: string | null) {
    if (!date) {
        return app.translator.trans('clarkwinkelmann-featured-discussions.forum.post.auto');
    }

    const d = dayjs(date);

    return d.format('YYYY-MM-DD HH:mm:ss') + ' (' + d.fromNow() + ')';
}

export default class FeaturedPost extends EventPost {
    icon() {
        return 'fas fa-certificate';
    }

    descriptionKey() {
        return 'clarkwinkelmann-featured-discussions.forum.post.' + (this.attrs.post.content().length ? '' : '') + 'scheduled';
    }

    descriptionData() {
        const content = this.attrs.post.content();

        return {
            from: formatDate(content.length > 0 ? content[0] : null),
            until: formatDate(content.length > 1 ? content[1] : null),
        };
    }
}
