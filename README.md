# 오늘의 날씨

국내 지역을 검색해 날씨 카드를 추가하고, 현재 날씨부터 예보와 생활 날씨 지수까지 확인할 수 있는 Vue 기반 날씨 대시보드입니다.

## 주요 기능

- 국내 지역 검색 및 날씨 카드 추가
- 현재 기온, 체감온도, 날씨 상태, 습도, 풍속 표시
- 대기질 지수와 미세먼지(PM10), 초미세먼지(PM2.5) 표시
- 향후 24시간 기온과 5일간 강수량·최저/최고 기온 시각화
- 빨래 지수, 외출 후회 지수, 세차 지수 제공
- 즐겨찾기와 즐겨찾기 도시만 보기
- 이름순, 기온 높은 순, 기온 낮은 순, 최신 추가순 정렬
- 추가 지역 삭제 및 Element Plus 확인창 제공
- 페이지당 4개의 날씨 카드 표시
- 최근 검색 기록 5개 저장, 개별 삭제 및 전체 삭제
- 섭씨/화씨 단위 전환
- 상세 페이지 방문 후 홈 화면의 검색어, 필터, 정렬, 페이지 상태 유지

## 기술 스택

- Vue 3 Composition API
- Vue Router
- Pinia
- Axios
- Element Plus
- Vite
- CSS/SVG 기반 예보 그래프

별도의 차트 라이브러리 없이 Vue의 계산 속성, CSS Grid와 SVG를 사용해 예보를 시각화했습니다.

## 사용 API

### Kakao Local API

사용자가 입력한 국내 주소와 행정구역을 검색하고 위도·경도와 법정동 코드(`b_code`)를 가져옵니다.

### OpenWeather API

- Current Weather Data: 현재 날씨
- 5 Day / 3 Hour Forecast: 3시간 단위 예보
- Air Pollution API: 대기질과 미세먼지

## 실행 방법

```bash
npm install
npm run dev
```

프로덕션 빌드는 다음 명령어로 확인할 수 있습니다.

```bash
npm run build
```

## 환경변수

프로젝트 루트의 `.env` 파일에 다음 값을 설정합니다.

```dotenv
VITE_KAKAO_GEO_URL=https://dapi.kakao.com/v2/local/search/address.json
VITE_KAKAO_API_KEY=Kakao_REST_API_KEY

VITE_OPENWEATHER_API_KEY=OpenWeather_API_KEY
VITE_OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5/weather
VITE_OPENWEATHER_FORECAST_URL=https://api.openweathermap.org/data/2.5/forecast
VITE_OPENWEATHER_AIR_POLLUTION_URL=https://api.openweathermap.org/data/2.5/air_pollution
```

자신의 API_KEY를 발급받아 수정 후 사용합니다.

## 지역 검색과 카드 추가 흐름

```text
검색어 2글자 이상 입력
        ↓ 400ms debounce
Kakao Local API에서 국내 지역 후보 조회
        ↓
b_code로 후보 식별 및 중복 확인
        ↓
선택한 후보의 lat, lon으로 OpenWeather API 호출
        ↓
현재 날씨와 대기질을 받아 새 카드 추가
        ↓
추가 지역과 검색 기록을 localStorage에 저장
```

지역 후보가 여러 개면 전체 주소를 함께 보여 주므로 같은 이름을 가진 지역을 구분할 수 있습니다. 후보 목록은 높이를 제한하고 스크롤할 수 있게 구성했습니다.

이미 추가된 지역을 선택하면 카드를 다시 추가하거나 검색 기록 순서를 변경하지 않고 안내 문구만 표시합니다. 실제로 새 카드가 추가된 경우에만 검색 기록에 저장됩니다.

## 검색 기록

- 검색창이 비어 있고 포커스된 경우 최근 검색 지역을 표시합니다.
- 2글자 이상 입력하면 최근 기록 대신 Kakao 지역 후보를 표시합니다.
- 실제로 날씨 카드 추가에 성공한 지역만 기록합니다.
- 법정동 코드인 `locationKey`를 기준으로 중복을 구분합니다.
- 최근 5개만 유지하며 개별 삭제와 전체 삭제를 지원합니다.
- 현재 카드 목록에 존재하는 지역에는 `이미 추가됨`을 표시합니다.
- 삭제했던 날씨 카드는 남아 있는 검색 기록을 통해 다시 추가할 수 있습니다.

검색 문자열 자체가 아니라 선택한 지역의 이름, 법정동 코드와 좌표를 저장합니다. 따라서 같은 이름의 지역을 구분할 수 있고 기록을 다시 선택할 때 Kakao API를 재호출하지 않아도 됩니다.

```json
[
  {
    "locationKey": "1120010900",
    "name": "서울 성동구 금호동1가",
    "addressName": "서울 성동구 금호동1가",
    "region1": "서울",
    "lat": 37.5548857249068,
    "lon": 127.02279294328,
    "searchedAt": 1787443200000
  }
]
```

## 브라우저 저장 데이터

| localStorage 키 | 저장 내용 |
| --- | --- |
| `weather-added-locations` | 사용자가 추가한 지역의 `locationKey`, 이름, 위도, 경도 |
| `weather-favorite-city-ids` | 즐겨찾기한 카드 ID 목록 |
| `weather-search-history` | 최근 추가에 성공한 검색 지역 최대 5개 |

초기 지역은 `src/constants/weather.js`에서 관리하고, 사용자가 추가한 지역만 `weather-added-locations`에 저장합니다. 추가 지역을 삭제하면 저장된 지역과 해당 즐겨찾기도 함께 제거합니다.

## 상태 유지와 갱신 정책

홈 화면은 `KeepAlive`로 캐시합니다. 상세 페이지를 확인하고 돌아와도 다음 상태가 유지됩니다.

- 현재 페이지
- 검색어와 검색 후보
- 정렬 및 필터
- 조회한 날씨 데이터
- 검색 목록의 스크롤 위치

홈 화면이 다시 활성화되면 마지막 조회 시각을 확인합니다. 데이터가 30분 이상 지난 경우에만 날씨를 다시 요청하며, 사용자는 새로고침 버튼으로 즉시 갱신할 수도 있습니다.

## 주요 디렉터리

```text
src/
├─ assets/                  # 공통 색상 변수와 날씨 화면 CSS
├─ components/practices/exercise/
│  ├─ AirPollutionInfo.vue # 대기질 정보
│  ├─ CurrentWeatherInfo.vue
│  ├─ SearchBar.vue        # 지역 검색과 최근 검색 기록
│  ├─ WeatherCard.vue
│  ├─ WeatherFilterBar.vue
│  ├─ WeatherForecast.vue # 시간별·일별 예보 UI
│  └─ WeatherLifeIndices.vue
├─ constants/weather.js    # 초기 국내 지역과 좌표
├─ services/
│  ├─ kakaoApi.js
│  └─ weatherApi.js
├─ stores/
│  ├─ configStore.js       # 단위와 즐겨찾기
│  ├─ searchHistoryStore.js
│  └─ weatherStore.js      # 사용자가 추가한 지역
├─ utils/
│  ├─ weather.js
│  ├─ weatherForecast.js
│  └─ weatherIndices.js
└─ views/
   ├─ WeatherHomeView.vue
   ├─ WeatherDetailView.vue
   └─ WeatherAboutView.vue
```

## 트러블슈팅

### 1. Store 선언 순서 때문에 localStorage 데이터가 로드되지 않는 문제

#### 문제 상황

즐겨찾기 상태를 먼저 만들고, 즐겨찾기를 불러오는 함수와 localStorage 관련 상수를 뒤에서 선언했더니 저장은 되지만 초기 로드가 정상적으로 동작하지 않았습니다.

#### 원인

함수 선언문은 호이스팅되더라도 함수가 실행되는 시점에 참조하는 `const`, `ref` 등의 값은 먼저 선언되고 초기화되어 있어야 합니다. Store 생성 과정에서 초기화되지 않은 값을 참조하면 정상적으로 상태를 만들 수 없습니다.

#### 해결 방법

Store 내부 코드를 의존 관계 순서로 정리했습니다.

```text
1. localStorage 키와 설정 상수
2. 상수를 사용하는 로드·저장 보조 함수
3. 로드 함수 결과로 생성하는 ref 상태
4. 상태를 조회하거나 변경하는 함수
5. Store에서 반환할 값
```

이 순서를 따르면 상태 초기화 시점에 필요한 값과 함수가 모두 준비되어 있어 코드 흐름도 쉽게 파악할 수 있습니다.

### 2. OpenGeocoding 대신 Kakao API를 사용한 이유

#### 문제 상황

국내 지역명을 검색했을 때 OpenGeocoding 결과가 불분명했고, `옥천리`, `서산리`처럼 같은 이름을 사용하는 지역을 정확하게 구분하기 어려웠습니다.

#### 원인

지역명만으로 중복을 판단하면 서울, 광주, 대구 등 서로 다른 지역의 동일한 동 이름을 같은 장소로 처리할 수 있습니다. OpenWeather의 도시 ID도 여러 법정동이 같은 도시 ID로 응답될 수 있으므로 지역 카드의 고유 키로 사용하기 어렵습니다.

#### 해결 방법

국내 주소 검색에 적합한 Kakao Local API로 변경했습니다. 후보에는 전체 주소를 표시하고 Kakao가 제공하는 법정동 코드 `b_code`를 `locationKey`로 사용합니다.

```text
서울 성동구 금호동1가 -> 1120010900
강원특별자치도 속초시 금호동 -> 5121010400
```

두 지역은 이름 일부가 같더라도 법정동 코드가 다르므로 각각 추가할 수 있습니다. `h_code`는 행정동 기준이고 결과에 따라 값이 없을 수 있어, 이 프로젝트에서는 법정동 검색 결과와 일관된 `b_code` 하나만 사용합니다.

### 3. 새로고침 후 고아 즐겨찾기 데이터 발생 문제

#### 문제 상황

새로고침 시 사용자가 추가한 카드는 사라졌지만, localStorage에 저장한 해당 카드의 즐겨찾기 ID는 남았습니다.

#### 해결 방법

추가 지역이 유지되도록 store를 이용해 저장합니다. 추후 저장된 법정동 코드 데이터로 중복 여부를 확인합니다. 추가 지역을 삭제할 때는 연결된 즐겨찾기도 함께 제거합니다.

### 4. 상세 페이지에서 돌아오면 항상 1페이지가 되는 문제

#### 문제 상황

상세 페이지에서 `뒤로 가기`를 누르면 메인 화면이 초기화되어 기존 필터, 정렬, 페이지 선택이 초기화됐습니다.

#### 원인

상세 페이지로 이동할 때 WeatherHomeView가 제거되고, 뒤로 갈 때 다시 생성되면서 `const currentPage = ref(1)`과 다른 UI 상태가 초기화되었습니다.

#### 해결 방법

`WeatherHomeView`를 `KeepAlive`로 캐시하고 `onActivated`에서 30분 TTL을 확인합니다. Store는 여러 화면에서 공유할 도메인 데이터에 사용하고, 홈에서만 쓰는 페이지·검색·필터 상태는 컴포넌트에 유지했습니다. URL Query는 API 결과나 검색 후보를 보존할 수 없어 선택하지 않았습니다.

### 5. Home과 Detail의 즐겨찾기 상태가 다른 문제

#### 문제 상황

Home에서 지역을 즐겨찾기에 추가했지만, 해당 지역의 상세 페이지에는 즐겨찾기된 상태가 반영되지않았습니다.

#### 원인

초기 지역의 즐겨찾기 ID가 Home에서는 `1835848`, Detail에서는 `weather:1835848` 형태로 전달되어 같은 지역이 서로 다른 즐겨찾기로 저장되었습니다.
날씨 카드에는 용도가 다른 식별자가 존재합니다.

- `weatherId`: OpenWeather API가 반환하는 도시 ID
- `b_code`: 카카오 API가 반환하는 법정동 코드
- `locationKey`: 앱 내부에서 초기 지역과 추가 지역을 고유하게 구분하기 위한 값

추가한 법정동은 서로 다른 지역이어도 OpenWeather에서 동일한 도시 ID를 반환할 수 있습니다. 따라서 추가 지역의 저장, 중복 검사, 삭제에는 OpenWeather ID 대신 카카오의 `b_code`를 사용해야 합니다. 초기 지역과 추가 지역의 ID 출처를 구분하기 위해 초기 지역의 `locationKey`에는 `weather:` 접두사를 붙였습니다.

```text
초기 지역 locationKey: weather:1835848
추가 지역 locationKey: 1120010900
```

그런데 Home에서는 즐겨찾기 ID로 `weatherId`를 사용하고, Detail에서는 전달받은 `locationKey`를 `cityItem.id`로 사용했습니다.

```text
Home 즐겨찾기 ID:   1835848
Detail 즐겨찾기 ID: weather:1835848
```

두 값은 같은 지역을 의미하지만 문자열이 다르기 때문에 Pinia Store와 localStorage에서는 서로 다른 즐겨찾기로 처리됐습니다.

문제 발생 당시 localStorage 예제:

```text
key: weather-favorite-city-ids
```

```json
["1835848", "weather:1835848", "1120010900"]
```

- `1835848`: Home에서 저장한 초기 지역 즐겨찾기
- `weather:1835848`: Detail에서 저장한 같은 초기 지역 즐겨찾기
- `1120010900`: 카카오 검색으로 추가한 법정동 즐겨찾기

#### 해결 방법

`configStore`에 `normalizeFavoriteId`를 추가해 즐겨찾기 ID가 Store로 들어오는 시점에 형식을 통일했습니다.

```js
const normalizeFavoriteId = (cityId) => String(cityId).replace(/^weather:/, '')
```

불러오기, 조회, 추가, 해제와 삭제에 같은 함수를 사용하고 기존 데이터의 중복도 제거합니다. `locationKey`는 지역 저장과 중복 검사에 필요하므로 유지하고, 즐겨찾기에서만 ID 형식을 통일했습니다.

### 6. 검색 기록 선택 시 목록이 닫히는 문제

#### 문제 상황

검색 기록의 두 번째 이후 항목을 선택하면 항목이 최신 위치로 재배치되는 과정에서 포커스를 잃어 드롭다운이 닫혔습니다. 제목이나 안내 문구처럼 포커스를 받을 수 없는 영역을 눌러도 같은 문제가 있었습니다.

#### 해결 방법

검색 영역 내부의 `pointerdown`은 드롭다운을 유지하고, 외부 클릭·Tab으로 영역 이탈·Escape 입력에만 닫히도록 처리했습니다. 이후 검색 기록 정책도 실제 새 카드가 추가된 경우에만 저장하도록 변경해, 이미 추가된 지역을 눌렀을 때 기록 순서가 바뀌지 않게 했습니다.

