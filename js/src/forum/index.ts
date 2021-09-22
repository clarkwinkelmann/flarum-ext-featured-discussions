import app from 'flarum/forum/app';
import {extend} from 'flarum/common/extend';
import ItemList from 'flarum/common/utils/ItemList';
import Badge from 'flarum/common/components/Badge';
import Button from 'flarum/common/components/Button';
import LinkButton from 'flarum/common/components/LinkButton';
import Discussion from 'flarum/common/models/Discussion';
import DiscussionControls from 'flarum/forum/utils/DiscussionControls';
import IndexPage from 'flarum/forum/components/IndexPage';
import SchedulePage from './components/SchedulePage';
import FeatureModal from './components/FeatureModal';
import FeaturedPost from './components/FeaturedPost';

app.initializers.add('clarkwinkelmann-featured-discussions', () => {
    app.routes.featureSchedule = {
        path: '/feature-schedule',
        component: SchedulePage,
    };

    app.postComponents.featureScheduled = FeaturedPost;

    extend(DiscussionControls, 'moderationControls', function (items: ItemList, discussion: Discussion) {
        if (!discussion.attribute('canFeature')) {
            return;
        }

        items.add('feature', Button.component({
            icon: 'fas fa-certificate',
            onclick() {
                app.modal.show(FeatureModal, {
                    discussion,
                });
            },
        }, app.translator.trans('clarkwinkelmann-featured-discussions.forum.controls.feature')));
    });

    extend(Discussion.prototype, 'badges', function (this: Discussion, badges: ItemList) {
        if (!this.attribute('isFeatured')) {
            return;
        }

        badges.add('featured', Badge.component({
            label: app.translator.trans('clarkwinkelmann-featured-discussions.forum.badge'),
            icon: 'fas fa-certificate',
            type: 'featured',
        }));
    });

    extend(IndexPage.prototype, 'navItems', function (items: ItemList) {
        if (app.forum.attribute('showSchedulePage')) {
            items.add('feature-schedule', LinkButton.component({
                href: app.route('featureSchedule'),
                icon: 'fas fa-certificate',
            }, app.translator.trans('clarkwinkelmann-featured-discussions.forum.nav.schedule')));
        }
    });
});
