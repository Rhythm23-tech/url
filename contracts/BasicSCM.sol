// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

error NotOwner();
error NotYetDelivered();
error WaitingForRemainingOrder();
error ReceivedOrderNotOfDesiredQuality();   

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}


contract BasicSCM {
     BasicSCM basicSCM;


    struct Transaction {
        address caller;
        string functionName;
        bytes32 Input;
        //uint256 numericInput;
        //string textInput;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount = 0;

    event DepositMade(address indexed sender, uint256 fund);
   

    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;
    uint256 public expectedDelivery;
    uint256 public quantity;
    uint256 public amount;
    uint256 public _input;
    uint256 public quality;
     uint256 public desiredPrice;
     uint256 public sellerapproval;
     uint256 public buyerapproval;
     uint256 public balance;
     uint256 public orderhasbeenshipped;
     bool public orderShippedCalled = false;
     bool public orderReceivedCalled = false;
     bool public lastTransactionSuccess = false;
     bool isFunder = false;
     uint256 public orderReceived; 
     string NA;
     address public Saddress;
     address public Baddress;
     uint256 public DT;
     uint256 public qnty;
     uint256 public DD;
     

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private /* immutable */ i_owner;
    address public constant tokenAddress = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;

   
    
     constructor() {
        i_owner = msg.sender;
        
    }
   

function fund(uint256 nos) public {
    // Assuming `tokenAddress` is the address of the USDC contract
     uint256 nosInSmallestUnit = nos * 10**6;
    IERC20 token = IERC20(tokenAddress);
    
    // Transfer tokens from the sender to this contract
    require(token.transferFrom(msg.sender, address(this), nosInSmallestUnit), "Transfer failed");
    
    // Update the mapping to track the amount funded in terms of the token
    s_addressToAmountFunded[msg.sender] += nosInSmallestUnit;
    balance= token.balanceOf(address(this));

 
        for (uint i = 0; i < s_funders.length; i++) {
            if (s_funders[i] == msg.sender) {
                isFunder = true;
                break;
            }
        }

        if (!isFunder && s_funders.length < 3) {
            s_funders.push(msg.sender);
        } else {
            revert("Only three users can fund this contract.");
        }
    addTransaction("fund", bytes32(nos));
}

    function addTransaction(string memory functionName, bytes32 Input) private {
        transactions[transactionCount] = Transaction(msg.sender, functionName, Input);
        transactionCount++;
    }

     function getTransaction(uint256 id) public view returns (Transaction[] memory) {
    Transaction storage txn = transactions[id];
    Transaction[] memory result = new Transaction[](1);
    result[0] = Transaction(txn.caller, txn.functionName, txn.Input);
    return result;
}

     function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }

    modifier onlyOwner() {
    require(msg.sender == i_owner, "Caller is not the owner");
    _;
}
  
    modifier onlyBuyer {
    require(msg.sender == Baddress, "Only Buyer can call this function.");
    _;
}

    modifier onlySeller {
    require(msg.sender != s_funders[0], "Only Seller can call this function.");
    _;
}


    function SellersAddress(address newSellersAddress) public onlyOwner {
    Saddress= newSellersAddress;
     }


    function BuyersAddress(address newBuyersAddress) public onlyOwner {
    Baddress= newBuyersAddress;
     }

    function delivery(uint256 nos) public onlyOwner{
        DT= nos;
    }

    function QualityN(uint256 nos) public onlyOwner{
        qnty= nos;
    }

    function DeliveryDeduc(uint256 nos) public onlyOwner{
        DD=nos;
    }

    
    function deliveryTime(uint256 day) public onlyBuyer{
        expectedDelivery= day;
       addTransaction("deliveryTime", bytes32(day));
    }

    function quantityarrived(uint256 nos) public onlyBuyer{
        quantity= nos;
       addTransaction("quantityarrived",bytes32(nos));
    }

  function desiredPricebybuyer(uint256 priceInToken) public onlyBuyer {
    // Convert price from ether to wei
  //  uint256 priceInWei = priceInEther * 1 ether;
    desiredPrice = priceInToken;
    addTransaction("desiredPricebybuyer",bytes32(priceInToken));
}

function NetPriceOfdefectivepieces(uint256 priceInToken) public onlySeller {
    // Convert price from ether to wei
   // uint256 priceInWei = priceInEther * 1 ether;
    if(priceInToken == desiredPrice) { 
        amount = desiredPrice; 
    } else revert();   

     addTransaction("NetPriceOfdefectivepieces",bytes32(priceInToken));
}

   function qualityofReceivedProduct (uint256 review) public onlyBuyer {
    quality = review;
    addTransaction("qualityofReceivedProduct", bytes32(review));
}

   function sellersApproval (uint256 number) public onlySeller{
    sellerapproval = number;
    addTransaction("sellersApproval",bytes32(number));
} 

   function buyersapproval (uint256 number) public onlyBuyer{
    buyerapproval = number;
    addTransaction("buyersapproval", bytes32(number));
} 

    function giveInput(uint256 nos) public onlyBuyer{
        _input= nos;
        addTransaction("giveInput", bytes32(nos));
    }

    function ordershipped(string memory id) public onlySeller {
        addTransaction("ordershipped", keccak256(abi.encodePacked(id)));
    }

 function orderShippingConfirmation(uint256 nos) public onlyBuyer{
        orderhasbeenshipped = nos;
        addTransaction("orderShippingConfirmation", bytes32(nos));
    }

     function orderhasbeenreceived( uint256 nos) public onlyBuyer{
            orderReceived = nos;
            addTransaction("orderhasbeenreceived", bytes32(nos));
        }

    function resetState() public  {
   expectedDelivery = DT;
    quantity = qnty;
    amount = 0;
    _input = 0;
    quality = 1;
    desiredPrice = 0;
    sellerapproval = 0;
    buyerapproval = 0;
    orderhasbeenshipped = 0;
    orderReceived = 0;
    balance = 0;
    s_addressToAmountFunded[msg.sender] = 0;
    s_funders = new address[](0);
    balance = 0;
    orderShippedCalled = false;
    orderReceivedCalled = false;
    lastTransactionSuccess = false;
    isFunder = false;
    Saddress = address(0);
    Baddress = address(0);
    DD=0 ;

    for (uint256 i = 0; i < transactionCount; i++) {
        delete transactions[i];
    }
}

     function FirstInstallment() public onlySeller{ 
        require(!orderShippedCalled, "OrderShipped can only be called once.");   

        IERC20 token = IERC20(tokenAddress);
            
    if(orderhasbeenshipped== 1){
    uint256 deduction = (balance * 25) / 100;
     balance -= deduction;

    require(token.transfer(Saddress,deduction),"Token transfer failed");

     orderShippedCalled = true;

    emit DepositMade(msg.sender, deduction);
    addTransaction("FirstInstallment", keccak256(abi.encodePacked(NA)));
  

  }

 
  }

  function SecondInstallment() public onlySeller{

     IERC20 token = IERC20(tokenAddress);
     require(!orderReceivedCalled, "orderReceived can only be called once.");
         if(orderReceived== 1){
     uint256 deduction = (balance * 25) / 100;
     balance -= deduction;

    require(token.transfer(Saddress,deduction),"Token transfer failed");

    orderShippedCalled = true;

    emit DepositMade(msg.sender, deduction);
    addTransaction("SecondInstallment", keccak256(abi.encodePacked(NA)));
        
    }
    }

    modifier Parameters{ 
          
    if(expectedDelivery > DT){
        require(balance >= DD, "Insufficient balance to withdraw");
       balance -= DD;
      // assert(balance == 2.9 ether);
    }

    if(quantity < qnty){
        require(_input > 0, "Cannot Proceed Further without giving input");
        if(_input ==  1){
            require(amount <= balance, "Insufficient balance for withdrawal");
             require( amount > 0, "Cannot Proceed Further without giving input");
          //  assert(amount == 1e18);
            balance -= amount;
          //  assert(balance == 2e18);
        } else {
            if(_input > 1) {
            revert WaitingForRemainingOrder();
            }
        }
    }

   // console.log("Quality before condition: ", quality);
    if(quality !=  1 ){
        require(_input > 0, "Cannot Proceed Further without giving input");
        if(_input ==  1){
            require(amount <= balance, "Insufficient balance for withdrawal");
            require( amount > 0, "Cannot Proceed Further without giving input");
            balance -= amount; 
           //  assert(balance == 2e18);            
        } else {
            if(_input > 1) {
            revert ReceivedOrderNotOfDesiredQuality();
            }
        }
    }

    _;
    }

  

    
   function withdraw() public payable onlySeller Parameters {
    require(sellerapproval == 1, "ReturnOrderNotYetReceived");
    require(buyerapproval == 1, "Buyer denied withdrawal");
    
     IERC20 token = IERC20(tokenAddress);
    // Ensure the balance is not zero and is less than or equal to the contract's balance
   // require(balance > 0 && balance <= address(this).balance, "Insufficient balance for withdrawal");

    // Transfer the balance amount to the buyer
    require(token.transfer(Saddress,balance),"Token transfer to Seller failed");

 

    // Transfer the remaining balance to the seller
   require(token.transfer(Baddress, token.balanceOf(address(this))), "Token transfer to Buyer failed");

    // Reset the buyer's funded amount to 0
    s_addressToAmountFunded[msg.sender] = 0;

     s_funders = new address[](0);
    balance = 0;

    resetState();

     addTransaction("withdraw", keccak256(abi.encodePacked(NA)));

}
   

   fallback() external payable {
        fund(msg.value); // Corrected line
    }
    receive() external payable {
        fund(msg.value); // Corrected line
    }

     function getAddresstoAmountFunded (address fundingAddress) external view returns(uint256){
        return s_addressToAmountFunded [fundingAddress];
    }

    function getFunder(uint256 index) external view returns (address){
        return s_funders[index];
    }

    function getOwner() external view returns (address){
        return i_owner;
        
    }

    function getAllFunders() public view returns (address[3] memory) {
    require(s_funders.length <= 3, "Too many funders");
    
    address[3] memory funders;
    for (uint256 i = 0; i < s_funders.length; i++) {
        funders[i] = s_funders[i];
    }
    return funders;
}

 function getBuyersAddress() public view returns (address) {
        return Baddress;
    }

}