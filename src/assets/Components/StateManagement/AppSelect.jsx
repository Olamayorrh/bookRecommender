import React, { useState, useReducer, useEffect, useCallback } from "react";

import listOfGenreOption from "../../../store/genre.json";
import listOfMoodOption from "../../../store/mood.json";
import SelectField from "./Select";

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "", ready: false };
    case "SET_MOOD":
      return { ...state, mood: action.payload, ready: false };
    case "SET_LEVEL":
      return { ...state, level: action.payload, ready: true };
    case "FETCH_START":
      return { ...state, loading: true };
    case "SET_AI_RESPONSES":
      return {
        ...state,
        aiResponses: action.payload,
        loading: false,
        ready: false,
      };

    case "FETCH_ERROR":
      return { ...state, loading: false, ready: false };
    default:
      return state;
  }
};

export default function AppSelect() {
  const [state, dispatch] = useReducer(reducer, {
    genre: "",
    mood: "",
    level: "",
    aiResponses: [],
    loading: false,
    ready: false,
  });

  const availableMoodBasedOnGenre = listOfMoodOption[state.genre] || [];

  const fetchRecommendations = useCallback(async () => {
    const { genre, mood, level, aiResponses } = state;
    if (!genre || !mood || !level) return;

    dispatch({ type: "FETCH_START" });

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const GEMINI_API_KEY = "AIzaSyDn-JjZnOK2bpnnngdhKccnRdHYpH7XTsw";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: ` Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        },
      );
      const data = await response.json();
      console.log(data);
      dispatch({ type: "SET_AI_RESPONSES", payload: data?.candidates || [] });
    } catch (err) {
      console.log(err);
    }
  }, [state.genre, state.mood, state.level, state.loading]);

  useEffect(() => {
    if (state.ready) {
      fetchRecommendations();
    }
  }, [state.ready, fetchRecommendations]);

  return (
    <section>
      <h1>Book Recommender</h1>

      <SelectField
        placeholder="Please select a genre"
        id="genre"
        options={listOfGenreOption}
        value={state.genre}
        onSelect={(value) => dispatch({ type: "SET_GENRE", payload: value })}
      />

      <SelectField
        placeholder="Please select a mood"
        id="mood"
        options={availableMoodBasedOnGenre}
        value={state.mood}
        onSelect={(value) => dispatch({ type: "SET_MOOD", payload: value })}
      />

      <SelectField
        placeholder="Please select your level"
        id="level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={state.level}
        onSelect={(value) => dispatch({ type: "SET_LEVEL", payload: value })}
      />

      <button
        disabled={state.loading}
        onClick={() => dispatch({ type: "SET_LEVEL", payload: state.level })}
      >
        {state.loading ? "Loading..." : "Get Recommendation"}
      </button>

      <br />
      <br />

      {state.aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend?.content?.parts?.[0]?.text}</p>
        </details>
      ))}
    </section>
  );
}
