<?php

use Flarum\Database\Migration;

return Migration::addColumns('discussions', [
    'featured_from' => ['datetime', 'nullable' => true, 'index' => true],
    'featured_until' => ['datetime', 'nullable' => true, 'index' => true],
]);
