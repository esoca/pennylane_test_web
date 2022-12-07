import './App.css';
import React, {useState} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';

import Highlighter from "react-highlight-words";

import axios from "axios";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();


function App() {
  const [ingredientSearchTerms, setIngredientSearchTerms] = useState(defaultIngredientSearchTerms);
  const [pageNumber, setPageNumber] = useState(1);

  return (
      <QueryClientProvider client={queryClient}>
        <Stack
            alignItems="center"
            justifyContent="center"
            spacing={3}
        >
          <h2>It's Dinner Time</h2>
          <p>Write your ingredients and press ENTER to find the most relevant recipes</p>
          <Stack justifyContent="space-between"  direction="row" spacing={3} sx={{ width: 1200 }} >
            <Autocomplete
                fullWidth
                multiple
                id="tags-filled"
                options={[]}
                defaultValue={defaultIngredientSearchTerms}
                freeSolo
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} />
                )}
                onChange={(_e, values) => {
                  setIngredientSearchTerms(values)
                  setPageNumber(1)
                }}
            />
          </Stack>
          { ingredientSearchTerms.length === 0 ? null : (
            <RecipeSearchResults
              ingredientSearchTerms={ingredientSearchTerms}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
            />
          )}
        </Stack>
      </QueryClientProvider>
  );
}

function RecipeSearchResults({ingredientSearchTerms, pageNumber, setPageNumber}) {
  const { status, data, error } = useSearchRecipes({ingredientSearchTerms, pageNumber});

  const highlightRegexes = ingredientSearchTerms.map(term => new RegExp(`\\b${term}\\b`, 'i'))

  return (
      <div>
        {status === "loading" ? (
            "Loading..."
        ) : status === "error" ? (
            <span>Error: {error.message}</span>
        ) : data.values.length === 0 ? (
            "No recipes found for the ingredients"
        ) : (
            <Stack
                alignItems="center"
                justifyContent="center"
                spacing={5}
            >
              <Pagination
                  count={data.total_pages}
                  page={data.page_number}
                  onChange={(_e, value) => {setPageNumber(value)}}
              />
              {
                data.values.map(recipeSearchResult => (
                    <Stack
                        key={recipeSearchResult.recipe.id}
                        alignItems="space-between"
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ width: 1100 }}
                    >
                      <Card sx={{ display: 'flex', height: 200 }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 200, height: 200 }}
                            image={recipeSearchResult.recipe.image_url}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: 350 }}>
                          <CardContent sx={{ flex: '1 0 auto' }}>
                            <h3>{recipeSearchResult.recipe.title}</h3>
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                spacing={1}
                                direction="row"
                            >
                              <TextField
                                  id="prep_time_mins"
                                  label="preparation time"
                                  variant="standard"
                                  InputProps={{
                                    readOnly: true,
                                    disableUnderline: true,
                                  }}
                                  defaultValue={recipeSearchResult.recipe.prep_time_mins + ' minutes'}
                              />
                              <TextField
                                  id="cook_time_mins"
                                  label="cook time"
                                  variant="standard"
                                  InputProps={{
                                    readOnly: true,
                                    disableUnderline: true,
                                  }}
                                  defaultValue={recipeSearchResult.recipe.cook_time_mins + ' minutes'}
                              />
                              <TextField
                                  id="rating"
                                  label="rating"
                                  variant="standard"
                                  InputProps={{
                                    readOnly: true,
                                    disableUnderline: true,
                                  }}
                                  defaultValue={recipeSearchResult.recipe.rating}
                              />
                            </Stack>
                          </CardContent>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Stack
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            spacing={0}
                            style = {{overflowY: 'scroll', width: 550}}
                        >
                          <p style = {{alignSelf: 'center'}}>
                            {recipeSearchResult.recipe.ingredients.length} Ingredient{recipeSearchResult.recipe.ingredients.length === 1 ? '' : 's'}
                          </p>
                          {
                            recipeSearchResult.recipe.ingredients.map((ingredient, i) => (
                                <Highlighter
                                    key={i}
                                    style={{margin: 0, padding: 0}}
                                    searchWords={highlightRegexes}
                                    textToHighlight= {'- ' + ingredient}
                                />
                            ))
                          }
                        </Stack>
                      </Card>
                      <p style = {{flex: 1, alignSelf: 'end', fontSize: '12px'}}>
                          missing {recipeSearchResult.unmatched_ingredients} ingredient{recipeSearchResult.unmatched_ingredients === 1 ? '' : 's'}
                      </p>
                    </Stack>
                ))
              }
                <Pagination
                    count={data.total_pages}
                    page={data.page_number}
                    onChange={(_e, value) => {setPageNumber(value)}}
                />
            </Stack>
        )}
      </div>
  );
}

function useSearchRecipes({ingredientSearchTerms, pageNumber}) {
  const resourceUrl = `${process.env.REACT_APP_API_BASE_URL}/api/recipes/search`
  const queryParams = {
    ingredient_search_terms: ingredientSearchTerms,
    page_number: pageNumber,
    page_size: 10,
  }

  const uri = axios.getUri({baseURL: resourceUrl, params: queryParams})

  return useQuery({
    queryKey: [uri],
    queryFn: async () => {
      const { data } = await axios.get(uri);
      return data.data;
    },
  });
}

const defaultIngredientSearchTerms = [
  'Yogurt',
  'Milk',
  'Vanilla',
  'Sugar',
]

export default App;
