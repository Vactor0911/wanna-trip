import {
  Avatar,
  Box,
  Button,
  debounce,
  Dialog,
  DialogContent,
  DialogProps,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { useCallback, useEffect, useState } from "react";
import axiosInstance, { getCsrfToken } from "../../utils/axiosInstance";
import { useAtomValue } from "jotai";
import { templateAtom } from "../../state/template";
import { enqueueSnackbar } from "notistack";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { getUserProfileImageUrl } from "../../utils";

interface User {
  user_uuid: string;
  email: string;
  name: string;
  profile_image: string;
}

const TemplateShareDialog = (props: DialogProps) => {
  const { open, onClose, ...other } = props;

  const template = useAtomValue(templateAtom);

  const [linkCopied, setLinkCopied] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<Array<User>>([]);
  const [collaborators, setCollaborators] = useState<Array<User>>([]);
  const [privacy, setPrivacy] = useState("private");

  // 링크 복사 버튼 클릭
  const handleLinkCopyButtonClick = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((keyword: string) => {
      if (!keyword.trim()) return;

      const searchUser = async () => {
        try {
          // CSRF 토큰 가져오기
          const csrfToken = await getCsrfToken();

          // 사용자 검색 API 호출
          const response = await axiosInstance.post(
            "/user/search",
            { keyword },
            {
              headers: { "X-CSRF-Token": csrfToken },
            }
          );

          if (response.data.success) {
            // 검색된 사용자 목록
            const users = response.data.users;

            // 등록된 공동 작업자 제외
            const filteredUsers = users.filter((user: User) => {
              return !collaborators.some(
                (collaborator) => collaborator.user_uuid === user.user_uuid
              );
            });

            setSearchedUsers(filteredUsers);
          }
        } catch (err) {
          console.error(err);
          enqueueSnackbar("사용자 검색에 실패했습니다.", {
            variant: "error",
          });
        }
      };

      searchUser();
    }, 300),
    [collaborators]
  );

  // 사용자 검색란 입력 변경
  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchKeyword(value);

      if (!value.trim()) {
        // 검색어가 비어있으면 검색 결과 초기화
        setSearchedUsers([]);
        return;
      }

      // 디바운스된 사용자 검색 함수 호출
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // 템플릿 공동 작업자 목록 불러오기
  const fetchCollaborators = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      // 템플릿 공동 작업자 목록 조회 API 호출
      const response = await axiosInstance.get(
        `collaborator/${template.uuid}`,
        {
          headers: { "X-CSRF-Token": csrfToken },
        }
      );

      // 공동 작업자 목록 설정
      const { collaborators } = response.data;
      setCollaborators(collaborators);
    } catch {
      enqueueSnackbar("템플릿 공동 작업자 목록을 불러오지 못했습니다.", {
        variant: "error",
      });
    }
  }, [template.uuid]);

  // 템플릿 공개 설정 불러오기
  const fetchTemplatePrivacy = useCallback(async () => {
    try {
      // CSRF 토큰 가져오기
      const csrfToken = await getCsrfToken();

      const response = await axiosInstance.get(
        `/template/privacy/${template.uuid}`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );
      const { privacy } = response.data;
      setPrivacy(privacy);
    } catch {
      enqueueSnackbar("템플릿 공개 설정을 불러오지 못했습니다.", {
        variant: "error",
      });
    }
  }, [template.uuid]);

  useEffect(() => {
    // 대화상자가 닫히면 상태 초기화
    if (!open) {
      setLinkCopied(false);
      setSearchKeyword("");
      setSearchedUsers([]);
      setCollaborators([]);
      setPrivacy("private");
      return;
    }

    // 대화상자가 열리면 공동 작업자 목록과 권한 설정 불러오기
    fetchCollaborators();
    fetchTemplatePrivacy();
  }, [fetchTemplatePrivacy, fetchCollaborators, open]);

  // 권한 설정 변경
  const handlePrivacyChange = useCallback(
    async (event: SelectChangeEvent<string>) => {
      const privacy = event.target.value;
      setPrivacy(privacy);

      // 템플릿 권한 설정 변경 API 호출
      try {
        const csrfToken = await getCsrfToken();

        axiosInstance.put(
          `/template/privacy/${template.uuid}`,
          { privacy: privacy },
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );
      } catch {
        enqueueSnackbar("템플릿 공개 설정을 변경하지 못했습니다.", {
          variant: "error",
        });
      }
    },
    [template.uuid]
  );

  // 공동 작업자 검색 결과 버튼 클릭
  const handleCollaboratorSearchResultButtonClick = useCallback(
    async (userUuid: string) => {
      // 검색 결과 초기화
      setSearchKeyword("");
      setSearchedUsers([]);

      // 공동 작업자 추가 API 호출
      try {
        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        // 공동 작업자 추가 API 호출
        axiosInstance.post(
          `/collaborator`,
          {
            templateUuid: template.uuid,
            collaboratorUuid: userUuid,
          },
          {
            headers: { "X-CSRF-Token": csrfToken },
          }
        );

        // 공동 작업자 목록 갱신
        fetchCollaborators();

        enqueueSnackbar("공동 작업자가 추가되었습니다.", {
          variant: "success",
        });
      } catch {
        enqueueSnackbar("공동 작업자를 추가하지 못했습니다.", {
          variant: "error",
        });
      }
    },
    [fetchCollaborators, template.uuid]
  );

  // 공동 작업자 제외 버튼 클릭
  const handleCollaboratorRemoveButtonClick = useCallback(
    async (userUuid: string) => {
      // 공동 작업자 제외 API 호출
      try {
        // CSRF 토큰 가져오기
        const csrfToken = await getCsrfToken();

        // 공동 작업자 제외 API 호출
        axiosInstance.delete(`/collaborator`, {
          data: {
            templateUuid: template.uuid,
            collaboratorUuid: userUuid,
          },
          headers: { "X-CSRF-Token": csrfToken },
        });

        // 공동 작업자 관련 데이터 갱신
        fetchCollaborators();
        setSearchKeyword("");
        setSearchedUsers([]);

        enqueueSnackbar("공동 작업자가 제외되었습니다.", {
          variant: "success",
        });
      } catch {
        enqueueSnackbar("공동 작업자를 제외하지 못했습니다.", {
          variant: "error",
        });
      }
    },
    [fetchCollaborators, template.uuid]
  );

  return (
    <Dialog
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: "450px",
            maxHeight: "80vh",
          },
        },
      }}
      open={open}
      onClose={onClose}
      {...other}
    >
      {/* 헤더 */}
      <Stack direction="row" spacing={1} alignItems="center" m={1} ml={2}>
        {/* 헤더 */}
        <Typography variant="h6" flex={1}>
          템플릿 공유하기
        </Typography>

        {/* 링크 복사 버튼 */}
        <Button
          startIcon={linkCopied ? null : <LinkRoundedIcon />}
          onClick={handleLinkCopyButtonClick}
        >
          {linkCopied ? "복사 완료!" : "링크 복사"}
        </Button>

        {/* 닫기 버튼 */}
        <IconButton size="small" onClick={() => onClose?.({}, "backdropClick")}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack gap={1.5}>
          {/* 헤더 */}
          <Typography variant="body2" color="text.secondary">
            공동 작업자
          </Typography>

          {/* 검색어 입력란 */}
          <TextField
            placeholder="이메일 / 닉네임"
            fullWidth
            value={searchKeyword}
            onChange={handleSearchInputChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
                sx: {
                  pl: 1,
                },
              },
              htmlInput: {
                sx: {
                  padding: 1,
                  px: 1.5,
                  pl: 0,
                },
              },
            }}
          />

          {/* 공동 작업자 목록 */}
          <Box maxHeight={200} mt={1} overflow="auto">
            {searchedUsers.length > 0 ? (
              <Stack>
                {searchedUsers.map((user, index) => (
                  <Button
                    key={`collaborator-search-result-button-${index}`}
                    sx={{
                      p: 0.5,
                    }}
                    onClick={() =>
                      handleCollaboratorSearchResultButtonClick(user.user_uuid)
                    }
                  >
                    <Stack
                      key={`collaborator-search-result-${index}`}
                      width="100%"
                      direction="row"
                      alignItems="center"
                      gap={1}
                    >
                      {/* 프로필 아이콘 */}
                      <Avatar
                        src={getUserProfileImageUrl(user.profile_image)}
                        alt={user.name}
                        sx={{
                          width: 32,
                          height: 32,
                        }}
                      />

                      {/* 사용자 정보 */}
                      <Stack flex={1} alignItems="flex-start">
                        {/* 닉네임 */}
                        <Typography variant="body2">{user.name}</Typography>

                        {/* 이메일 */}
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            ) : (
              <Stack gap={1.5}>
                {collaborators.map((collaborator, index) => (
                  <Stack
                    key={`collaborator-${index}`}
                    direction="row"
                    alignItems="center"
                    gap={1}
                  >
                    {/* 공동 작업자 프로필 아이콘 */}
                    <Avatar
                      src={getUserProfileImageUrl(collaborator.profile_image)}
                      alt={collaborator.name}
                      sx={{
                        width: 32,
                        height: 32,
                      }}
                    />

                    {/* 공동 작업자 닉네임 */}
                    <Typography
                      mr="auto"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {collaborator.name}
                    </Typography>

                    {/* 공동 작업자 제외 버튼 */}
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleCollaboratorRemoveButtonClick(
                          collaborator.user_uuid
                        )
                      }
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          {/* 권한 설정 */}
          <Typography variant="body2" color="text.secondary" mt={3}>
            권한 설정
          </Typography>

          {/* 전체 권한 설정 */}
          <Stack direction="row" alignItems="center" gap={1}>
            <PublicRoundedIcon />
            <Typography mr="auto">아무 사용자</Typography>

            {/* 전체 권한 콤보박스 */}
            <FormControl
              sx={{
                "& .MuiSelect-select": {
                  py: 1,
                },
              }}
            >
              <Select value={privacy} onChange={handlePrivacyChange}>
                <MenuItem value="private">비공개</MenuItem>
                <MenuItem value="public">전체 공개</MenuItem>
                <MenuItem value="link">링크가 있는 사용자</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateShareDialog;
