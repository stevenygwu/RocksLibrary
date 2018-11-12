<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Register_model extends CI_Model {
  private $CI;
  public function __construct() {
    parent::__construct();
    $this->CI =& get_instance();
  }
  
  public function register($userinfo) {
    $name = $userinfo->nickName;
    $openid = $userinfo->openId;
    $readbooks = array();
    $readbooks = json_encode($readbooks);
    $age = 0;
    $readage = 0;
    $uploadbooks = array();
    $uploadbooks = json_encode($uploadbooks);
    $downloadbooks = array();
    $downloadbooks = json_encode($downloadbooks);
    $tobereadbooks = array();
    $tobereadbooks = json_encode($tobereadbooks);
    $comments = array();
    $comments = json_encode($comments);

    if ($this->isRegistered($openid)) {
      return TRUE;
    }


    return $this->CI->db->insert('UserList', compact('name', 'openid', 'readbooks', 
                                                   'age', 'readage', 'uploadbooks',
                                                   'downloadbooks', 'tobereadbooks', 'comments'));
  }

  public function isRegistered($openid) {
    $result = $this->CI->db->get_where('UserList', array('openid' => $openid));

    if (!isset($result) || $result->num_rows() === 0)
		{
			return FALSE;
		}

		return TRUE;
  }

  public function getUserDetail($openid) {
    $result = $this->CI->db->get_where('UserList', array('openid' => $openid));

    if (!isset($result) || $result->num_rows() === 0)
		{
			return FALSE;
		}

		return $result->result_object()[0];
  }

  public function registerGroupId($groupId) {
    return $this->CI->db->insert('GroupList', compact('groupId'));
  }

  public function isGroupIdRegistered($groupId) {
    $result = get_instance()->db->get_where('GroupList', array('groupId' => $groupId));

    if (!isset($result) || $result->num_rows() === 0)
		{
			return FALSE;
		}

		return TRUE;
  }

  public function collect($openid, $isbn) {
    $result = $this->CI->db->get_where('UserList', array('openid' => $openid));

    if (!isset($result) || $result->num_rows() === 0)
		{
			return FALSE;
		}

    $tobereadbooks = json_decode($result->result_object()[0]->tobereadbooks);
    $tobereadbooks[] = $isbn;
    $tobereadbooks = json_encode($tobereadbooks);

    return $this->CI->db->update('UserList', compact('tobereadbooks'));
  }

}
