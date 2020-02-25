pragma solidity ^0.5.10;

library SafeMath {

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) 
            return 0;
        uint256 c = a * b;
        require(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0);
        uint256 c = a / b;
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;
        return c;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}


contract ERC20 {
    using SafeMath for uint256;

    mapping (address => uint256) internal _balances;
    mapping (address => mapping (address => uint256)) internal _allowed;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    uint256 internal _totalSupply;

    /**
    * @dev Total number of tokens in existence
    */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param owner The address to query the balance of.
    * @return A uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
    * @dev Function to check the amount of tokens that an owner allowed to a spender.
    * @param owner address The address which owns the funds.
    * @param spender address The address which will spend the funds.
    * @return A uint256 specifying the amount of tokens still available for the spender.
    */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }

    /**
    * @dev Transfer token to a specified address
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
    * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
    * Beware that changing an allowance with this method brings the risk that someone may use both the old
    * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
    * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
    * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    * @param spender The address which will spend the funds.
    * @param value The amount of tokens to be spent.
    */
    function approve(address spender, uint256 value) public returns (bool) {
        _allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
    * @dev Transfer tokens from one address to another.
    * Note that while this function emits an Approval event, this is not required as per the specification,
    * and other compliant implementations may not emit the event.
    * @param from address The address which you want to send tokens from
    * @param to address The address which you want to transfer to
    * @param value uint256 the amount of tokens to be transferred
    */
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        _transfer(from, to, value);
        _allowed[msg.sender][to] = _allowed[msg.sender][to].sub(value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0));
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

}

contract ERC20Mintable is ERC20 {

    address owner;
    string public name;
    string public symbol;
    uint8 public decimals;

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _balances[to] = _balances[to].add(amount);
        _totalSupply = _totalSupply.add(amount);
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _balances[from] = _balances[from].sub(amount);
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(from, address(0), amount);
    }

    function set(address _owner, string calldata _name, string calldata _symbol, uint8 _decimals) external {
        require(owner == address(0));
        owner = _owner;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

}

contract tokenFactory {
    address public template;

    event NewTokenCreated(address owner, address token);

    function newToken(address _owner, string calldata _name, string calldata _symbol, uint8 _decimals) external returns(address token) {
        token = createClone(template);
        ERC20Mintable(token).set(_owner, _name, _symbol, _decimals);
        emit NewTokenCreated(_owner, token);
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }

    constructor() public {
        ERC20Mintable instance = new ERC20Mintable();
        template = address(instance);
    }
}


contract Exchange {
    function swapEtherToToken(address token, uint minConversionRate) public payable returns(uint);
    function swapTokenToEther(address token, uint srcAmount, uint minConversionRate) public returns(uint);
}

contract CryptoStructuredFund {

    using SafeMath for uint256;

    uint256 public startBuy;
    uint256 public stopBuy;
    uint256 public startSell;
    uint256 public stopSell;
    uint256 public rate;
    bool public fulfilled;
    address payable wallet;

    address public factory = address(0xbeef);

    ERC20Mintable public PS;
    ERC20Mintable public ER;

    uint256 constant fee = 8e15;

    Exchange kyberEx = Exchange(0x818E6FECD516Ecc3849DAf6845e3EC868087B755);
    ERC20 DAI = ERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    event PurchacePS(address indexed purchacer, uint256 amount);
    event PurchaceER(address indexed purchacer, uint256 amount);

    function set(uint256 _startBuy, uint256 _stopBuy, uint256 _startSell, uint256 _stopSell, uint256 _rate, address payable _wallet) public {
        require(stopBuy == 0 && stopSell == 0 && wallet == address(0));
        startBuy = _startBuy;
        stopBuy = _stopBuy;
        startSell = _startSell;
        stopSell = _stopSell;
        rate = _rate;
        wallet = _wallet;
        DAI.approve(address(kyberEx), uint256(-1));
        PS = ERC20Mintable(tokenFactory(factory).newToken(address(this), "ETH20DAIPreferredShare", "PSDAI", 18));
        ER = ERC20Mintable(tokenFactory(factory).newToken(address(this), "ETH20DAIExcessReturn", "ERETH", 18));
    }

    // deposit DAI to earn interest
    function purchacePS(uint256 amount) public {
        require(now < startBuy);
        require(DAI.transferFrom(msg.sender, address(this), amount));
        require(DAI.transfer(wallet, amount.mul(fee).div(1e18)));
        PS.mint(msg.sender, amount);
        emit PurchacePS(msg.sender, amount);
    }

    // invest ether
    function purchaceER() public payable {
        require(now < startBuy);
        require(wallet.send(msg.value.mul(fee).div(1e18)));
        ER.mint(msg.sender, msg.value);
        emit PurchaceER(msg.sender, msg.value);
    }

    // withdraw DAI
    function redeemPS(uint256 amount) public {
        require(now > startSell);
        
        uint256 withdrawal = amount.mul(DAI.balanceOf(address(this))).div(PS.totalSupply());
        PS.burn(msg.sender, amount);

        require(DAI.transfer(msg.sender, withdrawal));
    }

    // redeem ether
    function redeemER(uint256 amount) public {
        require(fulfilled);

        uint256 withdrawal = amount.mul(address(this).balance).div(ER.totalSupply());
        ER.burn(msg.sender, amount);

        msg.sender.transfer(withdrawal);
    }

    //buy ether via KyberSwap
    function push() public {
        require(now > startBuy && now < startSell);
        uint256 portion = interpolation(startBuy, stopBuy, now);
        startBuy = now;

        uint256 amount = DAI.balanceOf(address(this)).mul(portion).div(1e18);
        uint256 IncomingEther = kyberEx.swapTokenToEther(address(DAI), amount, 1);

        msg.sender.transfer(IncomingEther.div(1000)); // 0.1% rebate to pusher
    }

    //sell ether to DAI 
    function pull() public {
        require(now > startSell && !fulfilled);
        uint256 portion = interpolation(startSell, stopSell, now);
        startSell = now;

        uint256 amount = address(this).balance.mul(portion).div(1e18);
        uint256 IncomingDAI = kyberEx.swapEtherToToken.value(amount)(address(DAI), 1);

        DAI.transfer(msg.sender, IncomingDAI.div(1000)); // 0.1% rebate to pusher


        if(DAI.balanceOf(address(this)) >= PS.totalSupply().mul(rate).div(1e18))
            fulfilled = true;

    }

    function interpolation(uint256 a, uint256 b, uint256 c) internal pure returns(uint256) {
        if(c > b) return 1e18;
        // (c - a) / (b - a) * 1e18
        return c.sub(a).mul(1e18).div(b.sub(a));
    }

    function () external payable {} // accept ether

}

contract factory {
    using SafeMath for uint256;
    
    address public template = address(0x692a70D2e424a56D2C6C27aA97D1a86395877b3A);

    address[] public CSFs;

    function newCSF(uint256 startTime, uint256 period, uint256 duration, uint256 rate, address payable wallet) public {
        address payable CSF = address(uint160(createClone(template)));
        CryptoStructuredFund(CSF).set(startTime, startTime.add(period), startTime.add(duration), startTime.add(period).add(duration), rate, wallet);
        CSFs.push(CSF);
    }

    function getCSFs() public view returns(address[] memory) {
        return CSFs;
    }

    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }

}
