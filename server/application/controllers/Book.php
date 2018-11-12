<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Helper\Util as Util;
use \QCloud_WeApp_SDK\Conf as Conf;
use \QCloud_WeApp_SDK\Constants as Constants;
use \QCloud_WeApp_SDK\Auth\AuthAPI as AuthAPI;
use \QCloud_WeApp_SDK\Model\User as User;

class Book extends CI_Controller {
	private $userinfo;

  public function __construct()
  {
      parent::__construct();
      $this->load->model('book_model');
      $this->userinfo = User::findUserBySKey(Util::getHttpHeader(Constants::WX_HEADER_SKEY));
  }
  
  public function index() {
      $data = json_decode(Util::getPostPayload());
      $code = 0;

      $this->json([
          'code' => $code,
          'data' => [
              'msg' => 'book index'
          ]
      ]);
  }

  public function isAdded() {
    $data = json_decode(Util::getPostPayload());
    $code = 0;

    $result = $this->book_model->isAdded($data->isbn);

    $code = ($result === FALSE) ? 1 : 0;

    $this->json([
      'code' => $code,
      'data' => [
          'msg' => 'check is added'
      ]
    ]);
  }

  public function getBook() {
    $data = json_decode(Util::getPostPayload());
    $code = 0;

    $result = $this->book_model->getBook($data->isbn);

    $code = ($result === FALSE) ? 1 : 0;

    $this->json([
      'code' => $code,
      'data' => [
          'msg' => json_encode($result)
      ]
    ]);
  }

  public function getBooks() {
    $data = json_decode(Util::getPostPayload());
    $code = 0;

    $result = $this->book_model->getBooks($data->sortType, $data->cnt, $data->offset);

    $code = $result === FALSE ? 1 : 0;

    $this->json([
      'code' => $code,
      'data' => [
          'msg' => json_encode($result)
      ]
    ]);
  }

  public function getBooksByIsbns() {
    $data = json_decode(Util::getPostPayload());
    $code = 0;

    $results = array();
    $i = 0;
    foreach( $data->isbns as $isbn) {
      $result = $this->book_model->getBook($isbn);
      if ($result !== FALSE) {
        $results[$i++] = $result;
      }
    }

    $this->json([
      'code' => $code,
      'data' => [
          'msg' => json_encode($results)
      ]
    ]);
  }

  public function addBook() {
    $data = json_decode(Util::getPostPayload());
    $code = 0;

    $userInfo = json_decode($this->userinfo->user_info);
    $ret = $this->book_model->addBook($userInfo, $data);

    $code = $ret ? 0 : 1;

    $this->json([
        'code' => $code,
        'data' => [
            'msg' => json_encode($data)
        ]
    ]);
  }
}
