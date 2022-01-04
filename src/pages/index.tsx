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
  HStack,
  Box,
  Heading,
  Text,
  Image,
  VStack,
  Stack,
  Icon,
  Center,
  Progress,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import {
  MdMyLocation,
  MdSearch,
  MdChevronRight,
  MdNavigation,
} from "react-icons/md";
import { useGeolocation } from "react-use";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { format } from "date-fns";

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

const convertDate = (date: Date) => {
  return format(date, "EEE, d MMM");
};

const Home: NextPage = () => {
  const { latitude, longitude } = useGeolocation();
  const [inputLocation, setInputLocation] = useState("");
  const router = useRouter();
  const { isOpen, onOpen: _onOpen, onClose } = useDisclosure();
  const onOpen = useCallback(() => {
    _onOpen();
    setInputLocation("");
  }, [_onOpen]);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const todaysWeather = weatherInfo?.consolidated_weather[0];

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={buttonRef}
      >
        <DrawerOverlay />
        <DrawerContent maxW="30%">
          <DrawerCloseButton top={4} right={4} />
          <DrawerHeader>Search for places</DrawerHeader>
          <DrawerBody>
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
            <List spacing={2} mt={2} display={inputLocation ? "block" : "none"}>
              {searchedLocations?.map((location) => (
                <ListItem
                  key={location.woeid}
                  py={4}
                  pl={4}
                  fontSize="xl"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderRadius={6}
                  border="2px solid transparent"
                  _hover={{ border: "2px solid #90CDF4" }}
                >
                  <Link href={`?woeid=${location.woeid}`}>
                    <a onClick={onClose}>{location.title}</a>
                  </Link>
                  <ListIcon as={MdChevronRight} />
                </ListItem>
              ))}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Grid h="100vh" minH="300px" templateColumns="30% 1fr" gap={1}>
        <GridItem rowSpan={1} colSpan={1}>
          <Flex px={8} py={4} justifyContent="space-between">
            <Button
              colorScheme="telegram"
              type="button"
              onClick={onOpen}
              ref={buttonRef}
            >
              Search for places
            </Button>
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
        </GridItem>
        <GridItem bg="gray">
          <Flex gap={4} flexWrap="wrap">
            {weatherInfo?.consolidated_weather
              .slice(1)
              .map((weather, index) => (
                <VStack
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  flex="1"
                  borderRadius="md"
                  key={weather.id}
                >
                  <Heading as="h4" fontSize="xl">
                    {index === 0
                      ? "Tomorrow"
                      : convertDate(new Date(weather.applicable_date))}
                  </Heading>
                  <Image
                    boxSize="70px"
                    objectFit="cover"
                    src={`https://www.metaweather.com/static/img/weather/${weather.weather_state_abbr}.svg`}
                    alt="Dan Abramov"
                  />
                  <HStack>
                    <Text>{Math.round(weather.max_temp)}°C</Text>
                    <Text>{Math.round(weather.min_temp)}°C</Text>
                  </HStack>
                </VStack>
              ))}
          </Flex>
          {todaysWeather && (
            <Stack>
              <Heading as="h2">Today&apos;s Hightlights</Heading>
              <Flex gap={10} flexWrap="wrap">
                <VStack
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  flex="1"
                  borderRadius="md"
                  minW="360px"
                >
                  <Heading as="h3" fontSize="2xl">
                    Wind status
                  </Heading>
                  <HStack spacing={0} alignItems="baseline">
                    <Text as="span" fontSize="8xl" fontWeight="bold">
                      {Math.round(todaysWeather.wind_speed)}
                    </Text>
                    <Text as="span" fontSize="4xl">
                      mph
                    </Text>
                  </HStack>
                  <HStack>
                    <Center
                      backgroundColor="white"
                      borderRadius="full"
                      width={6}
                      height={6}
                      transform={`rotate(${todaysWeather.wind_direction}deg)`}
                    >
                      <Icon
                        as={MdNavigation}
                        position="relative"
                        top={"-1px"}
                      />
                    </Center>
                    <Text as="span" fontSize="xl">
                      {todaysWeather.wind_direction_compass}
                    </Text>
                  </HStack>
                </VStack>
                <VStack
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  flex="1"
                  borderRadius="md"
                  minW="360px"
                >
                  <Heading as="h3" fontSize="2xl">
                    Humidity
                  </Heading>
                  <HStack spacing={0} alignItems="baseline">
                    <Text as="span" fontSize="8xl" fontWeight="bold">
                      {Math.round(todaysWeather.humidity)}
                    </Text>
                    <Text as="span" fontSize="4xl">
                      %
                    </Text>
                  </HStack>
                  <Box w="full" px={6}>
                    <Flex justifyContent="space-between" alignItems="baseline">
                      <Text as="span">0</Text>
                      <Text as="span">50</Text>
                      <Text as="span">100</Text>
                    </Flex>
                    <Progress
                      value={todaysWeather.humidity}
                      borderRadius="full"
                    />
                    <Flex justifyContent="flex-end">
                      <Text as="span">%</Text>
                    </Flex>
                  </Box>
                </VStack>
                <VStack
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  flex="1"
                  borderRadius="md"
                  minW="360px"
                >
                  <Heading as="h3" fontSize="2xl">
                    Visibility
                  </Heading>
                  <HStack spacing={0} alignItems="baseline">
                    <Text as="span" fontSize="8xl" fontWeight="bold">
                      {Math.round(todaysWeather.visibility * 10) / 10}
                    </Text>
                    <Text as="span" fontSize="4xl">
                      miles
                    </Text>
                  </HStack>
                </VStack>
                <VStack
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  flex="1"
                  borderRadius="md"
                  minW="360px"
                >
                  <Heading as="h3" fontSize="2xl">
                    Air Pressure
                  </Heading>
                  <HStack spacing={0} alignItems="baseline">
                    <Text as="span" fontSize="8xl" fontWeight="bold">
                      {Math.round(todaysWeather.air_pressure)}
                    </Text>
                    <Text as="span" fontSize="4xl">
                      mb
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </Stack>
          )}
          <pre>{JSON.stringify(weatherInfo, null, 2)}</pre>
        </GridItem>
      </Grid>
    </>
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

// todo
//  today weatherの表示
//  CとFの切り替え
