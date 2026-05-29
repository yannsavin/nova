<?php

require_once __DIR__ . '/../src/Models/Auction.php';

use PHPUnit\Framework\TestCase;

class AuctionModelTest extends TestCase
{
    public function testAuctionIsOpenWhenStatusAndDeadlineAreValid(): void
    {
        $this->assertTrue(Auction::isAuctionOpen('en_cours', date('Y-m-d H:i:s', strtotime('+1 hour'))));
        $this->assertFalse(Auction::isAuctionOpen('terminee', date('Y-m-d H:i:s', strtotime('+1 hour'))));
        $this->assertFalse(Auction::isAuctionOpen('en_cours', date('Y-m-d H:i:s', strtotime('-1 hour'))));
    }

    public function testBidAmountMustExceedCurrentPrice(): void
    {
        $this->assertTrue(Auction::isValidBidAmount(25.00, 26.00));
        $this->assertFalse(Auction::isValidBidAmount(25.00, 25.00));
        $this->assertFalse(Auction::isValidBidAmount(25.00, 24.99));
    }
}
