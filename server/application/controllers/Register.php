<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Helper\Util as Util;
use \QCloud_WeApp_SDK\Conf as Conf;
use \QCloud_WeApp_SDK\Constants as Constants;
use \QCloud_WeApp_SDK\Auth\AuthAPI as AuthAPI;
use \QCloud_WeApp_SDK\Model\User as User;

class Register extends CI_Controller {
	private $userinfo;

    public function __construct()
    {
        parent::__construct();
        $this->userinfo = User::findUserBySKey(Util::getHttpHeader(Constants::WX_HEADER_SKEY));
    }
    
    public function index() {
        $data = json_decode(Util::getPostPayload());
		    $gid = $this->getGid($data);
        $gidObj=json_decode($gid);
        $admin = Conf::getAdmin();
        $doRegister = FALSE;
        $userInfo = json_decode($this->userinfo->user_info);
        
        $isGroupIdRegistered = $this->register_model->isGroupIdRegistered($gid);

        if ($userInfo->openId === $admin || $isGroupIdRegistered) {
          $doRegister = TRUE;
        }

        if (!$isGroupIdRegistered && $doRegister) {
          $ret = $this->register_model->registerGroupId($gid);
          if (!$ret) {
            log_message('error', 'registerGroupId fail!');
          }
        }

        $code = 1;
        $ret = FALSE;
        if ($doRegister) {
          $ret = $this->register_model->register($userInfo);
          $code = $ret? 0 : 1;
        }

        if ($code === 0) {
          $msg = 'register success';
        } else {
          $msg = sprintf("register fail state %d %d %d %s", $isGroupIdRegistered, $doRegister, $ret, $gid);
        }
        
        $this->json([
            'code' => $code,
            'data' => [
                'msg' => $msg
            ]
        ]);
    }

  public function isRegistered() {
    $openId = json_decode($this->userinfo->user_info)->openId;
    $isRegistered = $this->register_model->isRegistered($openId);

    if (!$isRegistered) {
      $admin = Conf::getAdmin();
      if ($admin === $openId) {
        $userInfo = json_decode($this->userinfo->user_info);
        $isRegistered = $this->register_model->register($userInfo);
      }
    }
    
    if ($isRegistered) {
      $this->json([
        'code' => 0,
        'data' => [
            'msg' => 'registered'
          ]
      ]);
    } else {
      $this->json([
        'code' => 1,
        'data' => [
          'msg' => 'unregistered'
        ]
      ]);
    }
  }

  public function getUserDetail() {
    $openId = json_decode($this->userinfo->user_info)->openId;
    $udetail = $this->register_model->getUserDetail($openId);

    $code = ($udetail === FALSE) ? 1: 0;
    $this->json([
      'code' => $code,
      'data' => [
          'msg' => json_encode($udetail)
        ]
    ]);
  }

  private function getGid($shareData) {
    include_once(BASEPATH.'../application/helpers/wxBizDataCrypt.php');

    $appid = Conf::getAppId();
    $sessionKey = $this->userinfo->session_key;

    $pc = new WXBizDataCrypt($appid, $sessionKey);
    $errCode = $pc->decryptData($shareData->encryptedData, $shareData->iv, $gid );

    return json_decode($gid)->openGId;
  }

  public function collect() {
    $data = json_decode(Util::getPostPayload());
    $openId = json_decode($this->userinfo->user_info)->openId;
    $ret = $this->register_model->collect($openId, $data->isbn);

    $code = ($ret === FALSE) ? 1: 0;
    $this->json([
      'code' => $code,
      'data' => [
          'msg' => $ret
        ]
    ]);
  }
}
