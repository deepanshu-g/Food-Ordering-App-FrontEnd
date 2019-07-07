import React from 'react';
import './Details.css';
import Header from '../../common/header/Header';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import Add from '@material-ui/icons/Add';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';


const styles = {
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
};

class Details extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      restaurant_name: null,
      photo_URL: null,
      customer_rating: null,
      average_price: null,
      number_customers_rated: null,
      locality: null,
      categories: [],
      snackbarOpen: false,
      cartItems: 0,
      cartItemsList: [],
      snackbarMessage: null,
      cartTotalPrice: 0,
    }
  };

  componentDidMount() {
    // let id = sessionStorage.getItem('currentRest');
    console.log('props', this.props);
    const {
      history: {
        location: {
          pathname,
        } = {},
      } = {},
    } = this.props;
    let id = pathname.split('/')[2];
    this.getRestaurantDetails(id);
  };

  getRestaurantDetails = (id) => {
    let that = this;
    let url = `http://localhost:8080/api/restaurant/${id}`;
    return fetch(url, {
      method:'GET',
    }).then((response) => {
      console.log('response@@@@@@@@', response);
      if (response.ok) {
        return response.json();
      }
    }).then((responseJson) => {
      console.log('json', responseJson);
      that.setState({
        restaurant_name: responseJson.restaurant_name,
        photo_URL: responseJson.photo_URL,
        customer_rating: responseJson.customer_rating,
        average_price: responseJson.average_price,
        number_customers_rated: responseJson.number_customers_rated,
        locality: responseJson.address.locality,
        categories: responseJson.categories,
      });
    }).catch((error) => {
      console.log('error getting data', error);
    });
  };

  handleSnackBar = (message) => {
    this.setState({
      snackbarOpen: !this.state.snackbarOpen,
      snackbarMessage: message,
    });
  }

  checkoutHandler = () => {
    if (this.state.cartItems === 0) {
      this.handleSnackBar("Please add an item to your cart!");
    } else if (!sessionStorage.getItem("loggedIn")) {
      this.handleSnackBar("Please login first!");
    }else {
      // sessionStorage.setItem("cartItems",this.state.cartItemsList)
      // sessionStorage.setItem("cartTotalPrice",this.state.cartTotalPrice);
      this.props.addItems(this.state.cartItemsList)
      this.props.setCartTotal(this.state.cartTotalPrice)
      this.props.history.push('/checkout');
    }
  }

  removeItemFromCartHandler = (cartItem) => {
    let cartItemsList = this.state.cartItemsList;
    let index = cartItemsList.indexOf(cartItem);
    cartItemsList[index].quantity -= 1;
    if (cartItemsList[index].quantity === 0) {
      cartItemsList.splice(index, 1);
      this.handleSnackBar("Item removed from cart!");
    } else {
      this.handleSnackBar("Item quantity decreased by 1!");
    }
    this.setState({
      cartItems: this.state.cartItems - 1,
      cartItemsList: cartItemsList,
      cartTotalPrice: this.state.cartTotalPrice - cartItem.item.price,
    })
  }

  addItemFromCartHandler = (cartItem) => {
    this.handleSnackBar("Item quantity increased by 1!");
    let cartItemsList = this.state.cartItemsList;
    let index = cartItemsList.indexOf(cartItem);
    cartItemsList[index].quantity += 1;
    this.setState({
      cartItems: this.state.cartItems + 1,
      cartItemsList: cartItemsList,
      cartTotalPrice: this.state.cartTotalPrice + cartItem.item.price,
    });
  }

  addItemHandler = (item) => {
    this.handleSnackBar("Item added to cart!");
    let cartItemsList = this.state.cartItemsList;
    var cartItem;
    let cartItems = cartItemsList.map((el) => el.item);
    let index = cartItems.indexOf(item);
    if (index === -1) {
      cartItem = {
        item: item,
        quantity: 1,
      }
      cartItemsList.push(cartItem);
    } else {
      cartItemsList[index].quantity += 1;
      cartItem = cartItemsList[index]
    }

    this.setState({
      cartItems: this.state.cartItems + 1,
      cartItemsList: cartItemsList,
      cartTotalPrice: this.state.cartTotalPrice + cartItem.item.price,
    });
    console.log(JSON.stringify(cartItemsList));
  }

  render(){
    return(
      <div>

      {/* Header */}
      <div style={{marginTop: '64px'}}>
        <Header showSearch={false} />
      </div>

      {/* restaurant information section */}
      <div className="restaurant-information">
        <div className="restaurant-image">
          <div>
            <img
              src={this.state.photo_URL}
              alt='restaurant'
              width='100%'
            />
          </div>
        </div>
        <div className="restaurant-details">
          <div>
            <Typography variant="h3" gutterBottom> {this.state.restaurant_name} </Typography> <br />
            <Typography variant="h5" gutterBottom> {this.state.locality} </Typography> <br />
            <Typography variant="body1" gutterBottom> {this.state.categories
              && Array.isArray(this.state.categories)
              && this.state.categories.length > 0
              && this.state.categories.map((el) => el.category_name).join(", ")} </Typography>
          </div>
          <div style={{float:'left', display:"flex", flexDirection:"row", width:"100%", paddingTop:"5%"}}>
            <div style={{width:"100%"}}>
            <i className="fa fa-star" aria-hidden="true"> {this.state.customer_rating} </i>
            <Typography variant="caption" gutterBottom> AVERAGE RATING BY <br /> <span style={{fontWeight: 'bold'}}> {this.state.number_customers_rated} </span> USERS </Typography>
            </div>
            <div style={{width:"100%"}}>
            <i className="fa fa-inr" aria-hidden="true"> {this.state.average_price} </i>
            <Typography variant="caption" gutterBottom> AVERAGE COST FOR <br /> TWO PEOPLE </Typography>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-cart-section">

        {/* menu-items section */}
        <div className='menu'>
          <div style={{padding:'3%'}}>
            {this.state.categories.map(categoryItem =>
              <div key={categoryItem.id}>
                <CategoryItem item={categoryItem} this={this} />
              </div>
            )}
          </div>
        </div>

        {/* my-cart section */}
        <div className="cart">
          <div style={{padding:'3%'}}>
            <Card className={styles.card}>
              <CardContent>
                <div style={{display:"inline-block", width:"100%"}}>
                  <div style={{float:"left", width:"10%"}}><Badge badgeContent={this.state.cartItems} color="primary"><ShoppingCart /></Badge></div>
                  <div style={{float:"right", width:"90%"}}><Typography variant="h5" gutterBottom style={{fontWeight:'bold'}}> My Cart </Typography></div>
                </div>

                {/* items in cart */}
                {this.state.cartItemsList.map(cartItem =>
                  <div key={cartItem.id}>
                    <CartItem item={cartItem} this={this} />
                  </div>
                )}

                <div style={{display:"inline-block", width:"100%", paddingTop:"3%"}}>
                  <div style={{float:"left"}}><Typography variant="body1" gutterBottom style={{fontWeight:'bold'}}> TOTAL AMOUNT </Typography></div>
                  <div style={{float:"right", width: "14%"}}><i className="fa fa-inr" aria-hidden="true"> {this.state.cartTotalPrice.toFixed(2)} </i></div>
                </div>
              </CardContent>
              <CardActions>
                <div style={{width:"100%"}}>
                  <Button style={{width:"100%"}} variant="contained" color="primary" onClick={this.checkoutHandler}> CHECKOUT </Button>
                </div>
              </CardActions>
            </Card>
          </div>
        </div>
      </div>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={this.state.snackbarOpen}
        autoHideDuration={1000}
        onClose={(e) => this.handleSnackBar("")}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{this.state.snackbarMessage}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={(e) => this.handleSnackBar("")}
          >
          <CloseIcon />
          </IconButton>,
        ]}
      />

      </div>
    );
  }
}

function CartItem(props) {
  const cartItem = props.item;
  const color = props.item
  && props.item.item.item_type&&props.item.item.item_type.toString()
  && props.item.item.item_type.toLowerCase() === "non_veg" ? "red" : "green";
  console.log('prop1s', cartItem);
  return (
    <div style={{display:"flex", flexDirection:"row", width:"100%", padding:"1%"}}>
      <div style={{width:"10%", display:"flex", alignItems:"center",color: color}}><i className="fa fa-stop-circle-o" aria-hidden="true"></i></div>
      <div style={{width:"40%", display:"flex", alignItems:"center", textTransform:"capitalize"}}><span style={{color:"grey"}}> {cartItem.item.item_name} </span></div>
      <div style={{width:"5%", display:"flex", alignItems:"center"}}>
        <i onClick={(e) => props.this.removeItemFromCartHandler(cartItem)} className="cartButton fa fa-minus" aria-hidden="true" on></i>
      </div>
      <div style={{width:"5%", display:"flex", alignItems:"center"}}> {cartItem.quantity} </div>
      <div style={{width:"25%", display:"flex", alignItems:"center"}}>
        <i onClick={(e) => props.this.addItemFromCartHandler(cartItem)} className="cartButton fa fa-plus" aria-hidden="true" on></i>
      </div>
      <div style={{display:"flex", alignItems:"center"}}><i className="fa fa-inr" aria-hidden="true"><span style={{color:"grey"}}> {cartItem.item.price.toFixed(2)} </span></i></div>
    </div>
  )
}

function CategoryItem(props) {
  console.log('catttttt', props);
  return (
    <div style={{padding:"3%"}}>
      <Typography variant="caption" gutterBottom style={{fontWeight:"bold", textTransform:"uppercase"}}> {props.item.category_name} </Typography>
      <Divider />
      {props
        && props.item
        && props.item.item_list
        && Array.isArray(props.item.item_list)
        && props.item.item_list.length > 0
        && props.item.item_list.map(menuItem =>
        <div key={menuItem.id}>
          <MenuItem item={menuItem} this={props.this} />
        </div>
      )}
    </div>
  )
};

function MenuItem(props) {
  console.log('props', props);
  const color = props.item.item_type
    && props.item.item_type.toString()
    && props.item.item_type.toLowerCase() === "non_veg" ? "red" : "green";
    console.log('props.item.item_type', props.item.item_type);
  return (
    <div style={{display:"flex", flexDirection:"row", width:"100%", paddingLeft:"1%"}}>
      <div style={{width:"5%", display:"flex", alignItems:"center", color: color}}><i className="fa fa-circle" ></i></div>
      <div style={{width:"65%", display:"flex", alignItems:"center", textTransform:"capitalize"}}> {props.item.item_name} </div>
      <div style={{width:"20%", display:"flex", alignItems:"center"}}><i className="fa fa-inr" aria-hidden="true"> {props.item.price.toFixed(2)} </i></div>
      <div style={{width:"10%", display:"flex", alignItems:"center"}}>
        <IconButton onClick={(e) => props.this.addItemHandler(props.item)}><Add style={{height:"100%"}} /></IconButton>
      </div>
    </div>
  )
};

export default Details;
