import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { getRestaurent } from '../../../redux/actions/getRestaurentAction'
import Typography from "@material-ui/core/Typography";
import { fade, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import GpsFixedIcon from "@material-ui/icons/GpsFixed";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import axios from "axios";
import { useThrottle } from "use-throttle";
//import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
    search: {
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(1),
            width: "auto",
        },
    },
  searchIcon: {
    padding: theme.spacing(0, 1),
    height: "100%",
    position: "absolute",
    left: "0px",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function Modal() {
  const [name, setName] = useState("");
  const throttledText = useThrottle(name, 500);
  //const [showmap, setShowMap] = useState("false");
  const [lang, setLang] = useState(0);
  const [lat, setLat] = useState(0);
  const [curr, setCurr] = useState("Set Location");
  const [place, setPlace] = useState([]);
  const [centerLang, setCenterLang] = useState(0);
  const [centerLat, setCenterLat] = useState(0);
  const [open, setOpen] = React.useState(false);
  const [scroll, setScroll] = React.useState("paper");

    const dispatch = useDispatch()
    const resturantData = useSelector(state => state.getRestaurent.restaurentsData)

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const classes = useStyles();

  const descriptionElementRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

//   React.useEffect(()=>{
//     let payload = { 
//         lang:lang,
//         lat: lat
//     }
//     dispatch(getRestaurent(payload))
// },[lang, lat, curr])


  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  var config1 = {
    method: "get",
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lang},${lat}.json?types=locality&access_token=pk.eyJ1IjoicmFqZXN3YXJpLXN1YnJhbWFuaWFuIiwiYSI6ImNraDBrdjc2aTB5YWIzMHF2MnB1MmlvZmEifQ.WfdLqj4cqkuK8C764Xn2VQ`,
    headers: {},
  };

  var config2 = {
    method: "get",
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${throttledText}.json?country=in&access_token=pk.eyJ1IjoicmFqZXN3YXJpLXN1YnJhbWFuaWFuIiwiYSI6ImNraDBrdjc2aTB5YWIzMHF2MnB1MmlvZmEifQ.WfdLqj4cqkuK8C764Xn2VQ`,
    headers: {},
  };

  //RESTAURANT SEARCH
  // var config3 = {
  //   method: "get",
  //   url: `https://api.mapbox.com/geocoding/v5/mapbox.places/restaurants.json?types=poi&country=in&access_token=pk.eyJ1IjoicmFqZXN3YXJpLXN1YnJhbWFuaWFuIiwiYSI6ImNraDBrdjc2aTB5YWIzMHF2MnB1MmlvZmEifQ.WfdLqj4cqkuK8C764Xn2VQ`,
  //   headers: {},
  // };

  function success(pos) {
    var crd = pos.coords;
    setLang(crd.longitude);
    setLat(crd.latitude);

    let payload = {
        lang: crd.longitude,
        lat: crd.latitude
    }
    dispatch(getRestaurent(payload))
    
    console.log("Your current position is:");
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  //CURRENT LOCATION LANG LAT PLACENAME - Variables are lang, lat,curr
  function handleCurrent() {
    navigator.geolocation.getCurrentPosition(success, error, options);
    axios(config1)
      .then(function (response) {
        let temp = response.data.features[0].place_name.split(",");
        setCurr(`${temp[0]},${temp[1]}`);
      })
      .catch(function (error) {
        console.log(error);
      });
    setOpen(false);
  }

  function handleEnter(e) {
    e.target.style.background = "#F3F3F5";
  }

  function handleLeave(e) {
    e.target.style.background = "#ffffff";
  }

  //SELECTED PLACE LANG LAT PLACENAME-Variables are centerLang,centerLat,curr
  function handlePlace(e) {
    setName(e.target.value);
    axios(config2)
      .then(function (response) {
        response.data.features.map((item) => {
          let temp1 = item.place_name.split(",");
          setPlace((place) => [
            ...place,
            {
              name: `${temp1[0]},${temp1[1]}`,
            },
          ]);
          
        let payload = {
            lang: item.center[0],
            lat: item.center[1]
        }
        dispatch(getRestaurent(payload))

          setCenterLang(item.center[0]);
          setCenterLat(item.center[1]);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  console.log("current", lang, lat,curr, "place", centerLang, centerLat);

  return (
    <>
    <div className={classes.search}>
                <div style={{ color: "rgb(0, 210, 144)" }} className={classes.searchIcon}>
                    <LocationOnIcon />
                </div>
            </div>
            <Button  onClick={handleClickOpen("paper")} style={{ marginLeft: '20px', textTransform: 'none' }}>
                <span >{curr}</span>
                <div style={{ color: "rgb(0, 210, 144)" }}>
                    <ExpandMoreOutlinedIcon />
                </div>
            </Button>
      <Dialog
        open={open}
        style={{ padding: "30px" }}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
      >
        <DialogTitle style={{ textAlign: "center" }} id="form-dialog-title">
          Add your Location
        </DialogTitle>
        <DialogContent dividers={scroll === "paper"}>
          <TextField
            autoFocus
            fullWidth
            className={classes.margin}
            id="input-with-icon-textfield"
            placeholder="Enter area, building name"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => handlePlace(e)}
          />
          <Typography color="text.disabled" onClick={() => handleCurrent()}>
            {" "}
            <GpsFixedIcon style={{ color: "#00D290" }} /> Use Current Location
          </Typography>
          <hr />
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <div style={{ margin: "auto", width: "600px" }}>
              {place.map((item, i) => (
                <div key={i}>
                  <div
                    onMouseEnter={(e) => handleEnter(e)}
                    onMouseLeave={(e) => handleLeave(e)}
                    onClick={() => {
                      setCurr(item.name);
                      setOpen(false);
                    }}
                  >
                    {i > place.length - 6 && i <= place.length - 1 ? (
                      <p>
                        {item.name}
                        {item.lang}
                        {item.lat}
                        <hr />
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}