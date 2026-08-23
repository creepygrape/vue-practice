.env : baseurl, apikey
constants/weather.js : citypool

element-plus

- api loading
- pagination: paginationBar component
- 습도 progress
- 카드 삭제 확인창 : ElMessageBox.confirm(삭제확인), ElMessage.success(성공알림)
- 5일 강수량 : el-carousel
- 기온, 강수량 : tool-tip

localstorage 즐겨찾기(카드 + 상세페이지)
즐겨찾기만 보기

검색 도시 추가 : kakao api로 지역 좌표 -> openweather api -> store 저장.
5일 예보 + 그래프

정렬: 기본(초기 데이터 + 추가도시), 이름순, 기온 높은순/낮은순, 최신 추가순

최근 본 도시
테마

api 분리

트러블슈팅
(1) store 변수, 함수 선언 순서 : 즐겨찾기 -> 로컬 스토리지 순으로 했더니 저장은 되는데 로드 안됨. 이유는 로컬 스토리지 로드, 저장이 나중에 선언돼서 접근 불가. 함수 호출은 해도 괜찮지만 참조 값은 호출 시점까지 미리 선언/초기화돼 있어야함.
보통 다음과 같은 의존 관계 순서로 작성

1. 상수
2. 상수를 사용하는 보조 함수
3. 보조 함수 결과로 만드는 상태(ref)
4. 상태를 변경하는 함수
5. return

(2) opengeocoding vs kakao
오픈지오는 국내 검색이 불분명해서 카카오 api 사용.
동일한 이름을 가진 지역 존재 -> 추가했을 때 이름으로 중복을 판별하면 다른 지역에 있는 도시를 추가할 수 없음 -> 법정코드(b_code)로 중복 구분

(3) 추가 도시 즐겨찾기 삭제
추가 도시를 즐겨찾기 한 뒤 새로고침을 하면 추가한 도시는 없고 localstorage에 즐겨찾기 정보만 존재 -> 해당 도시를 다시 추가할 시 즐겨찾기된 상태로 추가됨
추가 지역도 유지되도록 store 저장 + 삭제 시 즐겨찾기 함께 제거

(4) 뒤로 가기 시 1페이지 이동
상세 페이지로 이동하면 WeatherHomeView가 제거되고, 메인으로 돌아올 때 다시 생성되기 때문. 다시 생성되면서 const currentPage = ref(1).
해결 방법 3가지 : keepAlive, currentPage를 store에서 관리, url쿼리에 페이지 저장
현재 문제는 “상세 페이지에 갔다가 돌아오면 메인 화면이 초기화되는 것”이었습니다. 그래서 KeepAlive를 선택했습니다.
선택한 이유:

- 메인 화면의 검색어, 필터, 정렬, 페이지 번호를 한 번에 유지
- 검색 후보와 후보 목록 스크롤 위치까지 보존
- 이미 조회한 날씨 API 결과도 유지
- 메인으로 돌아올 때 불필요한 API 재호출 방지
- 각 상태를 store나 URL과 일일이 동기화할 필요가 없음
- 상세 페이지를 잠깐 확인하고 목록으로 돌아오는 화면 흐름에 적합
- 기존 코드 변경 범위가 비교적 작음
  Pinia를 선택하지 않은 이유:
- 현재 페이지와 검색 조건은 메인 화면에서만 사용하는 UI 상태
- 전역 store로 옮기면 불필요한 전역 상태가 늘어남
- 검색 후보와 DOM 스크롤 위치는 별도 복원 코드가 필요
- API 결과와 각종 로딩·오류 상태까지 store로 옮기면 구조가 복잡해짐
  URL Query를 선택하지 않은 이유:
- 페이지·검색어·정렬 정도만 표현하기 적합
- API 결과나 검색 후보를 보존할 수 없음
- 스크롤 위치 복원이 별도로 필요
- 메인 컴포넌트가 다시 생성되므로 API가 다시 호출됨
- 현재는 검색 결과 링크 공유 요구가 없음

(5) Home과 Detail의 즐겨찾기 상태 불일치

문제 상황:

- Home에서 초기 지역을 즐겨찾기했지만 Detail에서는 즐겨찾기가 해제된 것처럼 표시됨
- 반대로 Detail에서 즐겨찾기해도 Home의 즐겨찾기 상태에 바로 반영되지 않음
- 사용자가 카카오 검색으로 추가한 지역에서는 같은 문제가 발생하지 않아 초기 지역에서만 문제가 보였음

원인:

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

해결 방법:

`configStore`에 `normalizeFavoriteId`를 추가해 즐겨찾기 ID가 Store로 들어오는 시점에 형식을 통일했습니다.

```js
const normalizeFavoriteId = (cityId) => String(cityId).replace(/^weather:/, '')
```

다음 작업에 모두 같은 정규화 함수를 적용했습니다.

- localStorage에서 기존 즐겨찾기 불러오기
- 즐겨찾기 여부 조회
- 즐겨찾기 추가 및 해제
- 지역 삭제 시 즐겨찾기 제거

```text
1835848         -> 1835848
weather:1835848 -> 1835848
```

기존 localStorage 데이터도 불러올 때 접두사를 제거하고 중복을 삭제합니다.

```json
["1835848", "1120010900"]
```

`locationKey`는 지역 저장과 중복 검사에 계속 필요하므로 제거하지 않았습니다. 대신 즐겨찾기 Store의 경계에서 ID 형식을 통일해 Home과 Detail이 같은 즐겨찾기 상태를 사용하도록 해결했습니다.
