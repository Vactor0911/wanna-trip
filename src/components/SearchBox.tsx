import { Box, Stack, TextField, Chip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
import { SxProps } from "@mui/system";

interface SearchBoxProps {
  regionTags: string[];
  onSearch: (selectedTags: string[], inputValue: string) => void;
  sx?: SxProps;
}

const SearchBox = ({ regionTags, onSearch, sx }: SearchBoxProps) => {
  // 검색창 텍스트 상태
  const [inputValue, setInputValue] = useState("");
  // 선택된 태그 목록 상태
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // 추천 태그 목록 상태
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  // 추천 목록 표시 여부 상태
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 입력값 변경 처리
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value; // 현재 입력된 전체 값

    // 입력된 텍스트를 공백으로 분리합니다.
    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1] || ""; // 마지막 단어 또는 빈 문자열

    // 마지막 단어가 '#'으로 시작하면 추천 태그 로직 실행
    if (lastWord.startsWith("#")) {
      const tagPrefix = lastWord.substring(1).toLowerCase(); // #을 제외한 태그 접두사

      // 지역 태그 목록에서 현재 입력된 접두사로 시작하고 아직 선택되지 않은 태그 필터링
      const filteredTags = regionTags.filter(
        (tag) =>
          tag.toLowerCase().startsWith(tagPrefix) && !selectedTags.includes(tag)
      );
      setSuggestedTags(filteredTags); // 추천 태그 목록 업데이트

      // 필터링된 태그가 있고 검색창에 포커스가 있다면 추천 목록 표시
      if (
        filteredTags.length > 0 &&
        document.activeElement?.closest(".search-input-box")
      ) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      // 마지막 단어가 #으로 시작하지 않으면 추천 목록 숨김
      setSuggestedTags([]);
    }

    // 입력값을 그대로 설정 (자동 태그 변환 제거)
    setInputValue(value);
  };

  // 상태 변경 감지
  useEffect(() => {
    // handleInputChange에서 suggestedTags와 showSuggestions 상태를 이미 설정하므로,
    // 여기서는 추가적인 로직 없이 의존성 배열을 통해 상태 변화에 반응하도록 둡니다.
  }, [inputValue, selectedTags, suggestedTags, showSuggestions]);

  // 검색 실행
  const handleSearch = () => {
    // 검색 실행 시 선택된 태그와 현재 입력된 텍스트를 조합하여 사용
    onSearch(selectedTags, inputValue);

    // 검색 실행 후 상태 초기화
    setSelectedTags([]);
    setInputValue("");
    setSuggestedTags([]);
    setShowSuggestions(false);
  };

  // 추천 태그 선택
  const handleSuggestionTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]); // 선택된 태그 목록에 추가
    }

    // 현재 입력값을 공백으로 분리
    const words = inputValue.split(/\s+/);

    // 마지막 단어가 #으로 시작하는 경우
    const lastWord = words[words.length - 1] || "";
    if (lastWord.startsWith("#")) {
      // 마지막 단어를 제외한 나머지 단어들을 다시 합침
      const remainingWords = words.slice(0, -1);
      const newInputValue = remainingWords.join(" ");

      // 남은 단어가 있으면 공백 추가, 없으면 빈 문자열
      setInputValue(newInputValue + (newInputValue ? " " : ""));
    }

    setSuggestedTags([]); // 추천 태그 목록 비움
    setShowSuggestions(false); // 추천 목록 숨김
  };

  // 태그 삭제
  const handleDeleteTag = (tagToDelete: string) => () => {
    // 선택된 태그 목록에서 해당 태그 삭제
    setSelectedTags((chips) => chips.filter((tag) => tag !== tagToDelete));
  };

  // 검색창 포커스
  const handleInputFocus = () => {
    // 포커스 시 현재 입력 값 기반으로 추천 태그 목록 표시 로직 실행
    const words = inputValue.split(/\s+/);
    const lastWord = words[words.length - 1] || "";

    if (lastWord.startsWith("#")) {
      const tagPrefix = lastWord.substring(1).toLowerCase();
      const filteredTags = regionTags.filter(
        (tag) =>
          tag.toLowerCase().startsWith(tagPrefix) && !selectedTags.includes(tag)
      );
      setSuggestedTags(filteredTags);
      if (filteredTags.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else if (inputValue.trim() === "") {
      // 입력 값이 비어있으면 전체 지역 태그 중 선택되지 않은 태그만 추천 목록으로 표시
      const filteredTagsForEmptyInput = regionTags.filter(
        (tag) => !selectedTags.includes(tag)
      );
      setSuggestedTags(filteredTagsForEmptyInput);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // 검색창 포커스 해제
  const handleInputBlur = () => {
    setTimeout(() => {
      if (
        !document.activeElement?.closest(".search-input-box") &&
        !document.activeElement?.closest(".region-suggestions-box")
      ) {
        setShowSuggestions(false);
        setSuggestedTags([]);
      }
    }, 100);
  };

  return (
    <Stack
      className="search-input-box"
      sx={{
        width: { xs: "100%", sm: "23em" },
        position: { xs: "static", sm: "absolute" },
        top: 0,
        right: 0,
        zIndex: 2,
        display: "flex",
        minHeight: 30,
        border: "1px solid #6F6F6F",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        p: 1,
        bgcolor: "white",
        mt: { xs: 2, sm: 0 },
        ...sx,
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            mb: 1,
            alignItems: "center",
          }}
        >
          {selectedTags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              onDelete={handleDeleteTag(tag)}
              size="small"
              color="primary"
              variant="outlined"
              clickable
              sx={{ justifyContent: "flex-start" }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={"게시글,글쓴이,카테고리,태그 검색"}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                style: { fontSize: "1rem" },
              }}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </Box>
          <IconButton onClick={handleSearch}>
            <SearchIcon sx={{ fontSize: 35, color: "#000" }} />
          </IconButton>
        </Box>

        {showSuggestions && suggestedTags.length > 0 && (
          <Box
            className="region-suggestions-box"
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 1,
              mt: 1.5,
              pb: 1.3,
            }}
          >
            {suggestedTags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                onClick={() => handleSuggestionTagClick(tag)}
                size="small"
                variant="outlined"
                clickable
                sx={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  minWidth: 0,
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  fontSize: "1.1rem",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default SearchBox;
