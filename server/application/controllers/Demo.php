<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Helper\Util as Util;

class Demo extends CI_Controller {
    public function index() {
        $var_dump = Util::getPostPayload();
        $this->json([
            'code' => 0,
            'data' => [
                'msg' => $var_dump
            ]
        ]);
    }
}