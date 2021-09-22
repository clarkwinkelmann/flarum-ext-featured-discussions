<?php

namespace ClarkWinkelmann\FeaturedDiscussions;

use Flarum\Api\Controller\ListDiscussionsController;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\Event\Saving;
use Flarum\Discussion\Filter\DiscussionFilterer;
use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/resources/less/forum.less')
        ->route('/feature-schedule', 'clarkwinkelmann-featured-discussions.schedule'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    new Extend\Locales(__DIR__ . '/resources/locale'),

    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attributes(ForumAttributes::class),

    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attributes(DiscussionAttributes::class),

    (new Extend\Event())
        ->listen(Saving::class, Listener\SaveDiscussion::class),

    (new Extend\Model(Discussion::class))
        ->dateAttribute('featured_from')
        ->dateAttribute('featured_until'),

    (new Extend\Filter(DiscussionFilterer::class))
        ->addFilter(Filter\FeaturedFilter::class)
        ->addFilter(Filter\ScheduledFilter::class),

    (new Extend\Post())
        ->type(Post\FeaturedPost::class),

    (new Extend\ApiController(ListDiscussionsController::class))
        ->addSortField('featuredFrom'),
];
