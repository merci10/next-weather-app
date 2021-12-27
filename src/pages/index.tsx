import type { NextPage } from "next";
import {
  Grid,
  GridItem,
  Flex,
  Button,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  ListIcon,
  IconButton,
} from "@chakra-ui/react";
import { MdMyLocation, MdSearch, MdChevronRight } from "react-icons/md";
import { useGeolocation } from "react-use";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

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
  const router = useRouter();

  const searchURLByLattLong = `https://www.metaweather.com/api/location/search/?lattlong=${latitude},${longitude}`;
  const nearbyLocations = useFetch<WeatherAPILocation[]>(
    `/api/cors-anywhere?url=${encodeURI(searchURLByLattLong)}`,
    latitude !== null && longitude !== null
  ); // 近くのロケーションの情報がいつくか入ってる

  const woeid =
    typeof router.query.woeid === "string" && router.query.woeid !== ""
      ? router.query.woeid
      : nearbyLocations?.[0].woeid;
  const searchURLByWoeid = `https://www.metaweather.com/api/location/${woeid}/`;
  const weatherInfo = useFetch<WeatherAPILocationWeather>(
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
          <Link href="/" passHref>
            <IconButton
              as="a"
              aria-label="search current location weather"
              icon={<MdMyLocation />}
              borderRadius="full"
              fontSize="2xl"
              color="gray.500"
            />
          </Link>
        </Flex>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <MdSearch color="gray.300" />
          </InputLeftElement>
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
              <Link href={`?woeid=${location.woeid}`}>
                <a>{location.title}</a>
              </Link>
              <ListIcon as={MdChevronRight} float="right" />
            </ListItem>
          ))}
        </List>
      </GridItem>
      <GridItem bg="papayawhip">
        <pre>{JSON.stringify(weatherInfo, null, 2)}</pre>
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
