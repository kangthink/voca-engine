## 어휘력 향상 도우미 앱 설계 문서

### 1. 개요

사용자가 (표현), (설명), (이미지) 입력을 통해 생성된 어휘 제안들을 수집하고 관리하며, 필요할 때마다 꺼내어 사용할 수 있는 어휘력 향상 도우미 앱입니다.

---

### 2. 주요 데이터 타입 (DSL)

```dsl
enum InputType {
  Expression    // (표현)
  Explanation   // (설명)
  Image         // (이미지)
}

datatype ExpressionInput {
  id: UUID
  type: InputType
  content: String
  createdAt: DateTime
}

datatype Suggestion {
  id: UUID
  inputId: UUID
  candidates: List<String>
  generatedAt: DateTime
}

datatype Collection {
  id: UUID
  name: String
  createdAt: DateTime
}

datatype Entry {
  id: UUID
  input: ExpressionInput
  suggestion: Suggestion
  collectionId: UUID
  tags: List<String>
  savedAt: DateTime
}
```

### 3. 연산(Operations)

```dsl
operation addInput(type: InputType, content: String) -> ExpressionInput
operation generateSuggestions(inputId: UUID) -> Suggestion
operation createCollection(name: String) -> Collection
operation listCollections() -> List<Collection>
operation saveEntry(inputId: UUID, suggestionId: UUID, collectionId: UUID, tags?: List<String>) -> Entry
operation listEntries(collectionId: UUID) -> List<Entry>
operation deleteEntry(entryId: UUID) -> void
operation searchEntries(collectionId: UUID, query: String) -> List<Entry>
operation renameCollection(collectionId: UUID, newName: String) -> Collection
```

---

### 4. 주요 기능 설명

1. **입력 관리**

   * 사용자가 텍스트(표현/설명) 또는 이미지 업로드를 통해 다양한 컨텍스트를 입력합니다.
   * `addInput` API를 통해 서버에 저장되고 고유 ID가 부여됩니다.

2. **어휘 제안 생성**

   * AI 엔진(LLM)을 호출하여 입력에 적합한 어휘 대체 표현, 상황별 어휘, 이미지 설명어휘 등을 생성합니다.
   * `generateSuggestions` 호출 시 `Suggestion.candidates` 목록에 제안 단어들이 채워집니다.

3. **보관함(Collection) 관리**

   * 사용자가 어휘 제안을 저장할 다수의 보관함을 생성하고 관리할 수 있습니다.
   * `createCollection`, `listCollections`, `renameCollection` 등을 통해 CRUD 지원.

4. **항목 저장 및 검색**

   * 각 입력과 제안을 묶어 보관함에 `Entry` 단위로 저장합니다.
   * 태그 추가, 키워드 검색(`searchEntries`) 기능을 통해 빠른 재사용이 가능합니다.

5. **UI/UX 흐름**

   * **입력 화면**: 표현·설명 텍스트 입력 또는 이미지 업로드
   * **제안 확인 화면**: 생성된 어휘 목록 확인 및 선택
   * **보관함 선택/저장**: 원하는 보관함 선택 후 저장, 태그 지정 가능
   * **보관함 탐색**: 사이드바에서 보관함 선택 → 저장된 항목 목록 확인 및 검색

---

### 5. 사용자 프롬프트 예시

* **(표현) 노래 소리가 잔잔하게 들린다**
  `addInput(type=Expression, content="노래 소리가 잔잔하게 들린다")`

* **(설명) 카페에 노래들으며 바깥 창을 바라보는데, 주변에 사람들이 보이는 상황**
  `addInput(type=Explanation, content="카페에 노래를 들으며 바깥 창을 바라보는데, 주변에 사람들이 보이는 상황")`

* **(이미지) 풍경 사진 업로드**
  `addInput(type=Image, content="https://example.com/image.jpg")`

* **어휘 제안 생성 요청**
  `generateSuggestions(inputId=<방금 생성된 input ID>)`

* **보관함 생성**
  `createCollection(name="일상 표현 모음")`

* **항목 저장**
  `saveEntry(inputId=<input ID>, suggestionId=<suggestion ID>, collectionId=<collection ID>, tags=["카페","감성"])`

---

위 문서를 기반으로 데이터베이스 스키마, API 스펙, 프론트엔드 컴포넌트 구현을 바로 시작할 수 있습니다.
