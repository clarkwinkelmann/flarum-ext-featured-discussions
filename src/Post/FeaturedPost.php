<?php

namespace ClarkWinkelmann\FeaturedDiscussions\Post;

use Carbon\Carbon;
use Flarum\Post\AbstractEventPost;
use Flarum\Post\MergeableInterface;
use Flarum\Post\Post;

class FeaturedPost extends AbstractEventPost implements MergeableInterface
{
    public static $type = 'featureScheduled';

    public function saveAfter(Post $previous = null)
    {
        if ($previous instanceof static && $this->user_id === $previous->user_id) {
            $previous->content = $this->content;
            $previous->created_at = $this->created_at;

            $previous->save();

            return $previous;
        }

        $this->save();

        return $this;
    }

    public static function reply($discussionId, $userId, Carbon $from = null, Carbon $until = null)
    {
        $post = new static;

        $post->content = static::buildContent($from, $until);
        $post->created_at = time();
        $post->discussion_id = $discussionId;
        $post->user_id = $userId;

        return $post;
    }

    public static function buildContent(Carbon $from = null, Carbon $until = null): array
    {
        if (is_null($from)) {
            return [];
        }

        if (is_null($until)) {
            return [$from->toW3cString()];
        }

        return [$from->toW3cString(), $until->toW3cString()];
    }
}
