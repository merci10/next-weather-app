import type { NextPage } from "next";
import {
  Grid,
  GridItem,
  SimpleGrid,
  Flex,
  Button,
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
  Icon,
  Center,
  Progress,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  MdMyLocation,
  MdSearch,
  MdChevronRight,
  MdNavigation,
  MdLocationOn,
} from "react-icons/md";
import { useGeolocation } from "react-use";
import { useEffect, useRef, useState } from "react";
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

const convertTempToF = (temp: number): number => {
  return (9 * temp + 32 * 5) / 5; // °C to °F
};

const useTempState = () => {
  const [tempUnit, setTempUnit] = useState<"°C" | "°F">("°C");

  const getTemp = (baseTemp: number) => {
    if (tempUnit === "°C") {
      return baseTemp;
    } else {
      return convertTempToF(baseTemp);
    }
  };

  return {
    tempUnit,
    setTempUnit,
    getTemp,
  };
};

const Home: NextPage = () => {
  const { latitude, longitude } = useGeolocation();
  const [inputLocation, setInputLocation] = useState("");
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { tempUnit, setTempUnit, getTemp } = useTempState();

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

  const drawerPlacement = useBreakpointValue({
    base: "top",
    md: "left",
  } as const);

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement={drawerPlacement}
        onClose={onClose}
        finalFocusRef={buttonRef}
      >
        <DrawerOverlay />
        <DrawerContent maxW="400px" minH="100vh">
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
            <List mt={2} display={inputLocation ? "block" : "none"}>
              {searchedLocations?.map((location) => (
                <ListItem
                  key={location.woeid}
                  height={16}
                  fontSize="xl"
                  borderRadius={6}
                  border="2px solid transparent"
                  _hover={{ border: "2px solid #90CDF4" }}
                >
                  <Link href={`?woeid=${location.woeid}`} passHref>
                    <Flex
                      pl={4}
                      as="a"
                      onClick={onClose}
                      height="full"
                      w="full"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box as="span">{location.title}</Box>
                      <ListIcon as={MdChevronRight} />
                    </Flex>
                  </Link>
                </ListItem>
              ))}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {todaysWeather && (
        <Grid
          h="100vh"
          minH="300px"
          templateColumns={{ base: "1fr", md: "400px 1fr" }}
        >
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
                  color="white"
                  backgroundColor="tomato"
                />
              </Link>
            </Flex>
            <Flex flexDirection="column" alignItems="center">
              <Image
                boxSize="150px"
                objectFit="cover"
                src={`https://www.metaweather.com/static/img/weather/${todaysWeather.weather_state_abbr}.svg`}
                alt={`${todaysWeather.weather_state_abbr} weather icon`}
                mt={20}
              />
              <HStack mt={10}>
                <HStack alignItems="baseline">
                  <Text as="div" fontSize="8xl" fontWeight="bold">
                    {Math.round(getTemp(todaysWeather.max_temp))}
                  </Text>
                  <Text as="div" fontSize="4xl">
                    {tempUnit}
                  </Text>
                </HStack>
                <HStack alignItems="baseline">
                  <Text as="div" fontSize="8xl" fontWeight="bold" ml={5}>
                    {Math.round(getTemp(todaysWeather.min_temp))}
                  </Text>
                  <Text as="div" fontSize="4xl">
                    {tempUnit}
                  </Text>
                </HStack>
              </HStack>
              <Text as="span" fontSize="5xl" mt={8}>
                {todaysWeather.weather_state_name}
              </Text>
              <Text as="span" fontSize="sm" mt={8}>
                today・{convertDate(new Date(todaysWeather.applicable_date))}
              </Text>
              <HStack mt={8}>
                <Icon as={MdLocationOn} />
                <Text as="i">{weatherInfo.title}</Text>
              </HStack>
            </Flex>
          </GridItem>
          <GridItem bg="gray" py={4} px={10}>
            <Flex justifyContent="flex-end">
              <IconButton
                aria-label="to °C"
                icon={<>°C</>}
                borderRadius="full"
                fontSize="md"
                color="white"
                backgroundColor={tempUnit === "°C" ? "tomato" : "gray.300"}
                onClick={() => setTempUnit("°C")}
                mr={3}
              />
              <IconButton
                aria-label="to °F"
                icon={<>°F</>}
                borderRadius="full"
                fontSize="md"
                color="white"
                backgroundColor={tempUnit === "°C" ? "gray.300" : "tomato"}
                onClick={() => setTempUnit("°F")}
              />
            </Flex>
            <SimpleGrid
              columns={{ base: 2, sm: 2, lg: 3, xl: 5 }}
              gap={4}
              mt={4}
            >
              {weatherInfo?.consolidated_weather
                .slice(1)
                .map((weather, index) => (
                  <VStack
                    p={5}
                    shadow="md"
                    borderWidth="1px"
                    borderRadius="md"
                    key={weather.id}
                  >
                    <Heading as="h4" fontSize={{ base: "sm", sm: "xl" }}>
                      {index === 0
                        ? "Tomorrow"
                        : convertDate(new Date(weather.applicable_date))}
                    </Heading>
                    <Image
                      boxSize="70px"
                      objectFit="cover"
                      src={`https://www.metaweather.com/static/img/weather/${weather.weather_state_abbr}.svg`}
                      alt={`${weather.weather_state_abbr} weather icon`}
                    />
                    <HStack>
                      <Text>
                        {Math.round(getTemp(weather.max_temp))}
                        {tempUnit}
                      </Text>
                      <Text>
                        {Math.round(getTemp(weather.min_temp))}
                        {tempUnit}
                      </Text>
                    </HStack>
                  </VStack>
                ))}
            </SimpleGrid>
            <Heading as="h2" mt={8}>
              Today&apos;s Hightlights
            </Heading>
            <SimpleGrid
              columns={{ base: 1, sm: 1, md: 1, lg: 2 }}
              gap={{ base: 4, md: 8 }}
              mt={4}
            >
              <VStack p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }}>
                  Wind status
                </Heading>
                <HStack spacing={0} alignItems="baseline">
                  <Text
                    as="span"
                    fontSize={{ base: "4xl", md: "8xl" }}
                    fontWeight="bold"
                  >
                    {Math.round(todaysWeather.wind_speed)}
                  </Text>
                  <Text as="span" fontSize={{ base: "2xl", md: "4xl" }}>
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
                    <Icon as={MdNavigation} position="relative" top="-1px" />
                  </Center>
                  <Text as="span" fontSize="xl">
                    {todaysWeather.wind_direction_compass}
                  </Text>
                </HStack>
              </VStack>
              <VStack p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }}>
                  Humidity
                </Heading>
                <HStack spacing={0} alignItems="baseline">
                  <Text
                    as="span"
                    fontSize={{ base: "4xl", md: "8xl" }}
                    fontWeight="bold"
                  >
                    {Math.round(todaysWeather.humidity)}
                  </Text>
                  <Text as="span" fontSize={{ base: "2xl", md: "4xl" }}>
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
              <VStack p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }}>
                  Visibility
                </Heading>
                <HStack spacing={0} alignItems="baseline">
                  <Text
                    as="span"
                    fontSize={{ base: "4xl", md: "8xl" }}
                    fontWeight="bold"
                  >
                    {Math.round(todaysWeather.visibility * 10) / 10}
                  </Text>
                  <Text as="span" fontSize={{ base: "2xl", md: "4xl" }}>
                    miles
                  </Text>
                </HStack>
              </VStack>
              <VStack p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }}>
                  Air Pressure
                </Heading>
                <HStack spacing={0} alignItems="baseline">
                  <Text
                    as="span"
                    fontSize={{ base: "4xl", md: "8xl" }}
                    fontWeight="bold"
                  >
                    {Math.round(todaysWeather.air_pressure)}
                  </Text>
                  <Text as="span" fontSize={{ base: "2xl", md: "4xl" }}>
                    mb
                  </Text>
                </HStack>
              </VStack>
            </SimpleGrid>
          </GridItem>
        </Grid>
      )}
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