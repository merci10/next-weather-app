import type { NextPage } from "next";
import {
  Grid,
  GridItem,
  Flex,
  Button,
  Spacer,
  Circle,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  ListIcon,
  InputRightAddon,
} from "@chakra-ui/react";
import { MdMyLocation, MdSearch, MdChevronRight } from "react-icons/md";
import { useGeolocation } from "react-use";
import { useEffect, useState } from "react";

const useFetch = <T,>(url: string, enabled: boolean = true) => {
  const [state, setState] = useState<T>();

  useEffect(() => {
    if (!enabled) return;

    const effect = async () => {
      const response = await fetch(url);
      const data: T = await response.json();
      setState(data);
    };
    effect();
  }, [url, enabled]);

  return state;
};

const Home: NextPage = () => {
  const { latitude, longitude } = useGeolocation();
  const [inputLocation, setInputLocation] = useState("");

  const searchURLByLattLong = `https://www.metaweather.com/api/location/search/?lattlong=${latitude},${longitude}`;
  const nearbyLocations = useFetch<WeatherAPILocation[]>(
    `/api/cors-anywhere?url=${encodeURI(searchURLByLattLong)}`,
    latitude !== null && longitude !== null
  ); // 近くのロケーションの情報がいつくか入ってる

  const searchURLByWoeid = `https://www.metaweather.com/api/location/${nearbyLocations?.[0].woeid}/`;
  const nearbyWeather = useFetch<WeatherAPILocationWeather>(
    `/api/cors-anywhere?url=${encodeURI(searchURLByWoeid)}`,
    nearbyLocations?.[0].woeid !== undefined
  );

  const searchURLByInput = `https://www.metaweather.com/api/location/search/?query=${inputLocation}`;
  const searchedLocations = useFetch<WeatherAPILocation[]>(
    `/api/cors-anywhere?url=${encodeURI(searchURLByInput)}`,
    inputLocation !== ""
  );

  return (
    <Grid h="100vh" minH="300px" templateColumns="30% 1fr" gap={1}>
      <GridItem rowSpan={1} colSpan={1} bg="tomato">
        <Flex p={[9, 9, 0, 9]}>
          <Button bg="gray.400" color="gray.50" borderRadius={0} type="button">
            Search for places
          </Button>
          <Spacer />
          <Circle size="40px" bg="gray.400" color="white" as="button">
            <MdMyLocation size={30} />
          </Circle>
        </Flex>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<MdSearch color="gray.300" />}
          />
          <Input
            pr="4.5rem"
            type="text"
            placeholder="search location"
            value={inputLocation}
            onChange={(e) => {
              setInputLocation(e.target.value);
            }}
          />
        </InputGroup>
        <List spacing={10} display={inputLocation ? "block" : "none"}>
          {searchedLocations?.map((location) => (
            <ListItem key={location.woeid}>
              {location.title}
              <ListIcon as={MdChevronRight} float="right" />
            </ListItem>
          ))}
        </List>
      </GridItem>
      <GridItem bg="papayawhip">
        <pre>{JSON.stringify(nearbyWeather, null, 2)}</pre>
      </GridItem>
    </Grid>
  );
};

export default Home;

type WeatherAbbreviation =
  | "sn"
  | "sl"
  | "h"
  | "t"
  | "hr"
  | "lr"
  | "s"
  | "hc"
  | "lc"
  | "c";

type WeatherAPILocation = {
  title: string;
  location_type: string;
  woeid: number;
  latt_long: string;
};

type WeatherAPILocationWeather = {
  consolidated_weather: {
    id: number;
    weather_state_name: string;
    weather_state_abbr: WeatherAbbreviation;
    wind_direction_compass: string;
    created: string;
    applicable_date: string;
    min_temp: number;
    max_temp: number;
    the_temp: number;
    wind_speed: number;
    wind_direction: number;
    air_pressure: number;
    humidity: number;
    visibility: number;
    predictability: number;
  }[];
  time: string;
  sun_rise: string;
  sun_set: string;
  timezone_name: string;
  parent: WeatherAPILocation;
  sources: {
    title: string;
    slug: string;
    url: string;
    crawl_rate: number;
  }[];
  title: string;
  location_type: string;
  woeid: number;
  latt_long: string;
  timezone: string;
};
