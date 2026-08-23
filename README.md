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

## 주요 디렉터리

```text
src/
├─ assets/                  # 공통 색상 변수와 날씨 화면 CSS
├─ components/practices/exercise/
│  ├─ AirPollutionInfo.vue # 대기질 정보
│  ├─ CurrentWeatherInfo.vue
│  ├─ PaginationBar.vue  # Element Plus 기반 커스텀 Pagination
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

## 추가 구현 사항

### 즐겨찾기

홈 카드와 상세 화면이 `configStore`의 같은 즐겨찾기 상태를 사용합니다. 즐겨찾기 ID는 `weather-favorite-city-ids`로 localStorage에 저장하므로 새로고침해도 유지됩니다.

초기 지역의 `weather:1835848`과 `1835848` 같은 ID 표현 차이는 `normalizeFavoriteId` 함수로 정규화합니다. 사용자가 추가한 지역을 삭제할 때는 저장된 지역과 즐겨찾기를 함께 제거해 고아 즐겨찾기 ID가 남지 않게 했습니다.

### 지역 검색과 카드 추가

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

지역 후보가 여러 개면 전체 주소와 스크롤 가능한 목록을 표시합니다. 같은 이름의 지역은 Kakao의 법정동 코드 `b_code`를 `locationKey`로 사용해 구분합니다. 이미 추가된 지역은 안내만 표시하고 카드나 검색 기록을 변경하지 않습니다.

### 검색 기록

- 검색창이 비어 있고 포커스되면 최근 검색 지역을 표시합니다.
- 2글자 이상 입력하면 검색 기록 대신 Kakao 지역 후보를 표시합니다.
- 실제 날씨 카드 추가에 성공한 지역만 최대 5개까지 저장합니다.
- 개별 삭제와 전체 삭제를 지원하며, 현재 카드로 추가된 지역은 `이미 추가됨`으로 표시합니다.
- 삭제한 날씨 카드는 남은 검색 기록으로 다시 추가할 수 있습니다.

검색어가 아니라 선택한 지역의 `locationKey`, 이름, 좌표를 `weather-search-history`에 저장합니다. 따라서 같은 이름의 지역을 구분할 수 있고, 기록을 다시 선택할 때 Kakao API를 재호출하지 않고 저장된 좌표를 사용합니다.

### KeepAlive와 30분 TTL

홈 화면을 `KeepAlive`로 캐시해 상세 화면에서 돌아왔을 때 현재 페이지, 검색어·후보, 정렬·필터, API 응답과 스크롤 위치를 유지합니다.

`onActivated`에서 마지막 조회 시각을 확인하고 30분이 지난 경우에만 날씨를 다시 요청합니다. 상태 보존과 데이터 신선도를 같이 관리하며, 사용자는 새로고침 버튼으로 즉시 갱신할 수 있습니다.

### Pagination 컴포넌트

Element Plus의 `el-pagination`을 홈 화면에 직접 작성하지 않고 `PaginationBar.vue`로 분리했습니다. 이 컴포넌트가 공통 레이아웃과 Element Plus 이벤트 연결을 담당하므로, 부모는 현재 페이지와 전체 개수만 관리합니다.

```vue
<PaginationBar
  v-if="!isLoading"
  v-model:current-page="currentPage"
  :page-size="pageSize"
  :total="filteredWeatherList.length"
/>
```

`PaginationBar.vue`는 `currentPage`, `pageSize`, `total`을 props로 받고 `update:currentPage`를 emit해 `v-model:current-page`를 구현합니다. `layout="prev, pager, next"`로 필요한 조작만 보여 주고, `total > 0`인 경우에만 표시하며 CSS로 가운데 정렬한 커스텀 Pagination으로 구성했습니다.

홈 화면의 `pageSize` 값은 4입니다. 정렬된 카드 목록을 현재 페이지에 맞게 `slice` 처리합니다.

```js
const start = (currentPage.value - 1) * pageSize
return sortedWeatherList.value.slice(start, start + pageSize)
```

검색, 날씨 필터, 즐겨찾기 필터나 정렬 기준이 바뀌면 현재 페이지를 1로 돌려 변경된 목록의 범위를 벗어난 페이지가 표시되지 않게 했습니다.

### 정렬과 필터

`WeatherFilterBar.vue`에서 날씨 상태, 정렬 기준, 즐겨찾기만 보기를 제어합니다.

- 날씨 필터: 전체, 맑음, 흐림, 구름, 비, 바람
- 정렬: 기본순, 이름순, 기온 높은 순, 기온 낮은 순, 최신 추가순
- 즐겨찾기 필터: 즐겨찾기한 카드만 표시

정렬할 때는 Store가 관리하는 원본 배열을 바꾸지 않고 `[...filteredWeatherList.value]`로 복사한 배열만 정렬합니다. 따라서 사용자가 정렬 기준을 바꾸어도 추가 지역의 저장 순서는 변경되지 않습니다.

### 브라우저 저장 데이터

| localStorage 키 | 저장 내용 |
| --- | --- |
| `weather-added-locations` | 사용자가 추가한 지역의 `locationKey`, 이름, 위도, 경도 |
| `weather-favorite-city-ids` | 즐겨찾기한 카드 ID 목록 |
| `weather-search-history` | 최근 추가에 성공한 검색 지역 최대 5개 |

초기 지역은 `src/constants/weather.js`에서 관리하고, 사용자가 추가한 지역만 `weather-added-locations`에 저장합니다.


## 트러블슈팅

### 1. Store 선언 순서 때문에 localStorage 데이터가 로드되지 않는 문제

#### 문제 상황

즐겨찾기 상태를 먼저 만들고, 즐겨찾기를 불러오는 함수와 localStorage 관련 상수를 뒤에서 선언했더니 저장은 되지만 초기 로드가 정상적으로 동작하지 않았습니다.

#### 원인

함수 선언문은 호이스팅되더라도 함수가 실행되는 시점에 참조하는 `const`, `ref` 등의 값은 먼저 선언되고 초기화되어 있어야 합니다. Store 생성 과정에서 초기화되지 않은 값을 참조하면 정상적으로 상태를 만들 수 없습니다.

#### 문제 예제

아래처럼 `favoriteCityIds` 초기화 과정에서 `loadFavorites()`를 즉시 호출하면, 함수 내부에서 사용하는 상수와 보조 로직이 호출 시점보다 먼저 초기화되어 있어야 합니다.

```js
// 상태 초기화가 localStorage 설정과 로드 로직에 의존함
const favoriteCityIds = ref(loadFavorites())
```

저장 함수는 버튼을 누를 때 나중에 실행되므로 동작했지만, 로드 함수는 Store가 만들어지는 순간 실행되어 선언 순서의 영향을 받았습니다. 이 차이 때문에 “저장은 되지만 새로고침 후 불러오지 못하는” 것처럼 보였습니다.

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

#### 해결 결과

앱 시작 시 localStorage의 즐겨찾기가 Pinia 상태로 안정적으로 복원되고, 새로고침 전후에도 즐겨찾기 표시가 일치하게 되었습니다. Store 내부의 의존 관계도 위에서 아래로 읽히게 되어 추가 저장 상태를 만들 때도 같은 순서를 적용할 수 있습니다.

### 2. OpenGeocoding 대신 Kakao API를 사용한 이유

#### 문제 상황

국내 지역명을 검색했을 때 OpenGeocoding 결과가 불분명했고, `옥천리`, `서산리`처럼 같은 이름을 사용하는 지역을 정확하게 구분하기 어려웠습니다.

#### 원인

지역명만으로 중복을 판단하면 서울, 광주, 대구 등 서로 다른 지역의 동일한 동 이름을 같은 장소로 처리할 수 있습니다. OpenWeather의 도시 ID도 여러 법정동이 같은 도시 ID로 응답될 수 있으므로 지역 카드의 고유 키로 사용하기 어렵습니다.

OpenGeocoding은 전 세계 지명을 대상으로 하므로 국내 법정동과 행정동을 항상 일관된 형식으로 구분하지 않았습니다. 또한 좌표만으로는 동일 이름 지역의 중복 판정을 안정적으로 유지하기 어렵습니다.

#### 문제 예제

`"옥천리"`을 검색하면 서울 성동구, 강원 속초시, 대구 북구 등의 서로 다른 지역이 후보로 나올 수 있습니다. 만약 단순히 `region_3depth_name` 같은 지역명만 비교하면 첫 번째 옥천리을 추가한 뒤 다른 시도의 옥천리을 중복으로 잘못 판단합니다.

카카오 응답에는 `h_code`와 `b_code`가 모두 있거나 둘 중 하나만 있는 경우가 있었습니다. 행정동과 법정동을 혼용하면 같은 후보를 서로 다른 지역으로 보거나, 코드가 빈 후보의 키가 불안정해질 수 있었습니다.

#### 해결 방법

국내 주소 검색에 적합한 Kakao Local API로 변경했습니다. 후보에는 전체 주소를 표시하고 Kakao가 제공하는 법정동 코드 `b_code`를 `locationKey`로 사용합니다.

```text
서울 성동구 옥천리1가 -> 1120010900
강원특별자치도 속초시 옥천리 -> 5121010400
```

두 지역은 이름 일부가 같더라도 법정동 코드가 다르므로 각각 추가할 수 있습니다. `h_code`는 행정동 기준이고 결과에 따라 값이 없을 수 있어, 이 프로젝트에서는 법정동 검색 결과와 일관된 `b_code` 하나만 사용합니다.

후보를 표시할 때는 `address_name`을 함께 보여 사용자가 동일 이름의 지역을 직접 구분하게 했습니다. 선택 후에는 `b_code`를 `locationKey`로, `x`/`y`를 `lon`/`lat`으로 변환해 OpenWeather 좌표 조회와 Store 저장에 사용합니다.

#### 해결 결과

같은 동 이름을 가진 서로 다른 국내 지역을 각각 날씨 카드로 추가할 수 있게 되었습니다. 중복 검사, 추가 지역 저장, 검색 기록이 모두 같은 `locationKey` 기준을 사용해 판단 기준도 일관되었습니다.

### 3. 새로고침 후 고아 즐겨찾기 데이터 발생 문제

#### 문제 상황

새로고침 시 사용자가 추가한 카드는 사라졌지만, localStorage에 저장한 해당 카드의 즐겨찾기 ID는 남았습니다.

#### 원인

즐겨찾기는 `weather-favorite-city-ids`에 저장했지만, 사용자가 검색해 추가한 지역은 `WeatherHomeView` 내부의 `weatherList` 배열에만 있었습니다. 새로고침하면 메모리 상태는 초기화되지만 localStorage의 즐겨찾기는 남아, 화면에 없는 카드를 가리키는 고아 즐겨찾기 ID가 생겼습니다.

#### 문제 예제

```text
1. 옥천리 카드 추가
2. 옥천리 즐겨찾기 선택
3. 새로고침
4. 옥천리 카드는 사라지지만 즐겨찾기 ID는 localStorage에 남음
5. 같은 지역을 다시 추가하면 처음부터 즐겨찾기된 카드로 표시됨
```

지역 데이터와 즐겨찾기가 다른 생명주기로 관리되어 사용자가 의도하지 않은 상태가 복원되었습니다.

#### 해결 방법

`weatherStore`를 추가해 사용자가 추가한 지역의 `locationKey`, 이름, `lat`, `lon`을 `weather-added-locations`에 저장했습니다. 앱이 다시 시작되면 저장한 좌표로 OpenWeather API를 호출해 카드를 복원합니다.

삭제 시에는 `weatherStore.removeLocation(locationKey)`와 `configStore.removeFavorite(item.id)`를 함께 실행해 지역과 즐겨찾기의 생명주기를 맞춰습니다.

#### 해결 결과

새로고침해도 추가한 지역과 즐겨찾기가 함께 유지됩니다. 추가 카드를 삭제하면 해당 지역과 즐겨찾기가 같이 삭제되므로 고아 즐겨찾기 ID도 남지 않습니다.

### 4. 상세 페이지에서 돌아오면 항상 1페이지가 되는 문제

#### 문제 상황

상세 페이지에서 `뒤로 가기`를 누르면 메인 화면이 초기화되어 기존 필터, 정렬, 페이지 선택이 초기화됐습니다.

#### 원인

상세 페이지로 이동할 때 WeatherHomeView가 제거되고, 뒤로 갈 때 다시 생성되면서 `const currentPage = ref(1)`과 다른 UI 상태가 초기화되었습니다.

Vue Router가 라우트를 전환하면 기본적으로 기존 라우트 컴포넌트가 unmount됩니다. 따라서 현재 페이지뿐 아니라 검색어, 필터, 정렬, 검색 후보, API 응답과 로딩 상태까지 모두 사라졌습니다. 홈으로 돌아올 때는 `onMounted` 흐름이 다시 실행되어 API도 재호출될 수 있었습니다.

#### 문제 예제

```text
1. 홈 화면에서 3페이지로 이동
2. 이름순 정렬과 즐겨찾기 필터 선택
3. 카드의 상세보기 선택
4. 뒤로 가기 또는 메인 화면으로 돌아가기
5. 페이지가 1로, 정렬과 필터가 기본값으로 초기화됨
```

페이지 번호만 Store나 URL Query에 저장하면 해당 값은 복원할 수 있지만, 검색 후보와 API 결과, 드롭다운 스크롤 위치까지 복원하려면 별도 상태와 동기화 로직이 필요했습니다.

#### 해결 방법

`App.vue`의 `RouterView`에서 `WeatherHomeView`를 `KeepAlive` 대상으로 지정해 unmount 대신 deactivated 상태로 보관했습니다.

```vue
<KeepAlive include="WeatherHomeView">
  <component :is="Component" />
</KeepAlive>
```

캐시를 쓰면 화면 상태는 유지되지만 날씨가 계속 오래된 값으로 남을 수 있어, `onActivated`에서 마지막 조회 시각을 확인하는 30분 TTL 정책을 추가했습니다.

```text
재활성화 시점 - 마지막 API 조회 시각 < 30분 -> 기존 데이터 사용
재활성화 시점 - 마지막 API 조회 시각 >= 30분 -> 날씨 재조회
```

Store는 추가 지역과 즐겨찾기처럼 여러 화면이 공유하거나 영구 저장할 도메인 데이터에만 사용했습니다. 페이지·검색·필터는 홈 화면 전용 UI 상태이므로 컴포넌트에 남겼습니다. URL Query는 검색 조건을 공유해야 하는 요구가 없고 API 결과와 DOM 스크롤 상태를 직접 보존하지 못해 선택하지 않았습니다.

#### 해결 결과

상세 페이지에서 돌아와도 기존 페이지, 정렬, 필터, 검색 후보와 API 결과가 유지됩니다. 30분 안에 돌아오면 불필요한 API 호출을 하지 않고, 30분이 지난 뒤에는 자동으로 최신 날씨를 받습니다.

### 5. Home과 Detail의 즐겨찾기 상태가 다른 문제

#### 문제 상황

Home에서 지역을 즐겨찾기에 추가했지만, 해당 지역의 상세 페이지에는 즐겨찾기된 상태가 반영되지않았습니다.

#### 원인

초기 지역의 즐겨찾기 ID가 Home에서는 `1835848`, Detail에서는 `weather:1835848` 형태로 전달되어 같은 지역이 서로 다른 즐겨찾기로 저장되었습니다. Home과 Detail이 같은 Pinia Store를 사용하고 있어도 Store에 전달하는 키의 형식이 다르면 반응성만으로는 같은 대상임을 판단할 수 없습니다.
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

#### 문제 예제

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

Store에 새 ID가 들어오는 모든 경계에 정규화를 적용했습니다.

- `loadFavorites`: 기존 localStorage 데이터 변환 및 중복 제거
- `isFavorite`: Home과 Detail의 조회 키 통일
- `toggleFavorite`: 추가·해제 전 ID 정규화
- `removeFavorite`: 추가 지역 삭제 시 같은 ID 기준 사용

#### 해결 결과

Home과 Detail이 어떤 형식의 ID를 전달하더라도 즐겨찾기 Store 내부에서는 같은 `1835848` 형식으로 비교합니다. 기존 localStorage에 `1835848`과 `weather:1835848`가 둘 다 있어도 로드 시 `1835848` 하나로 정리되어 두 화면의 즐겨찾기 상태가 즉시 일치합니다.

### 6. 검색 기록 선택 시 목록이 닫히는 문제

#### 문제 상황

검색 기록의 두 번째 이후 항목을 선택하면 항목이 최신 위치로 재배치되는 과정에서 포커스를 잃어 드롭다운이 닫혔습니다. 제목이나 안내 문구처럼 포커스를 받을 수 없는 영역을 눌러도 같은 문제가 있었습니다.

#### 원인

기존에는 `focusin`/`focusout`만으로 드롭다운 열림 상태를 판단했습니다. 두 번째 기록을 누르면 선택 항목이 배열 앞으로 이동하면서 클릭한 DOM 노드가 교체되었고, `relatedTarget` 없이 포커스가 사라지면서 드롭다운도 닫혔습니다. 첫 번째 기록은 순서가 바뀌지 않아 DOM이 유지되었기 때문에 문제가 드러나지 않았습니다.

#### 문제 예제

```text
새로고침 -> 검색창 포커스 -> 1번 기록 선택 -> 순서 유지 -> 드롭다운 유지
새로고침 -> 검색창 포커스 -> 2~5번 기록 선택 -> 첫 번째로 이동 -> DOM 교체 -> 드롭다운 닫힘
```

또한 `최근 검색 지역` 제목과 `이미 추가한 도시입니다` 안내는 포커스 가능한 요소가 아니어서 클릭하면 검색 영역 내부에 머물러 있다는 것을 `focusout`만으로는 판단할 수 없었습니다.

#### 해결 방법

`SearchBar.vue`에서 검색 영역의 DOM을 `searchControlRef`로 참조하고, document의 `pointerdown` 대상이 검색 영역 내부인지 판단하도록 변경했습니다.

```js
const handleDocumentPointerDown = (event) => {
  isDropdownOpen.value = Boolean(searchControlRef.value?.contains(event.target))
}
```

- 검색 영역 내부 `pointerdown`: 드롭다운 유지
- 검색 영역 외부 클릭: 드롭다운 닫기
- Tab으로 영역 이탈: `focusout` 기준으로 닫기
- Escape 입력: 즉시 닫기

또한 `handleSelectCandidate`에서 중복 검사를 검색 기록 저장보다 먼저 실행하고, OpenWeather 조회와 카드 추가가 성공한 후에만 `addSearchHistory(candidate)`를 호출하도록 순서를 변경했습니다.

#### 해결 결과

검색 기록의 어떤 항목이나 제목·안내 문구를 눌러도 검색 영역 내부에서는 드롭다운이 유지됩니다. 이미 추가된 지역은 안내만 표시하고 검색 기록 순서를 바꾸지 않으며, 실제 새 날씨 카드가 추가된 경우에만 검색 기록이 갱신됩니다.
