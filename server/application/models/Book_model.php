<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Book_model extends CI_Model {
  private $CI;
  public function __construct() {
    parent::__construct();
    $this->CI =& get_instance();
  }
  
  public function addBook($userinfo, $book) {
    $title = $book->title;
    $summary = $book->summary;
    $author = $book->author;
    $img = $book->img;
    $isbn = $book->isbn;
    $owner = $userinfo->openId;
    $reader = '';
    $state = $book->state;
    $score = $book->score;
    $date = date("Y-m-d H:i:s");
    $readers = 0;
    $comments = 0;
    $imgUrl = $book->imgUrl;
    $ebooksrc = $book->ebooksrc;

    $isAdded = $this->isAdded($isbn);

    if (!$isAdded) {
      return $this->CI->db->insert('H00BookList', compact('title', 'summary', 'author', 'img', 
                                                    'isbn', 'owner', 'reader', 'state', 'score', 
                                                    'date', 'readers', 'comments', 'imgUrl', 'ebooksrc'));
    } else {
      return $this->CI->db->update('H00BookList', compact('summary', 'owner', 'reader',
                                                          'state', 'score', 'readers',
                                                          'comments', 'imgUrl','ebooksrc'), array('isbn' => $isbn));
    }
  }

  public function isAdded($isbn) {
    $result = $this->CI->db->get_where('H00BookList', array('isbn' => $isbn));

    if (!isset($result) || $result->num_rows() === 0)
		{
			return FALSE;
		}

		return TRUE;
  }

  public function getBook($isbn) {
    $query = $this->CI->db->get_where('H00BookList', array('isbn' => $isbn));

    if (!isset($query) || $query->num_rows() === 0)
		{
			return FALSE;
		}

		return $query->result()[0];
  }

  public function getBooks($sortType, $cnt, $offset) {
    $query = $this->CI->db->get('H00BookList', $cnt, $offset);

    if (!isset($query) || $query->num_rows() === 0)
		{
			return FALSE;
		}

    return $query->result();
  }

  public function getBooksByIsbns($isbns) {
    $query = $this->CI->db->get('H00BookList', $cnt, $offset);

    if (!isset($query) || $query->num_rows() === 0)
		{
			return FALSE;
		}

    return $query->result();
  }
}
