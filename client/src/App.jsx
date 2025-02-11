import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const App = () => {
  const [allItems, setAllItems] = useState({ name: "", email: "", id: "" });

  // Query to fetch users from the server
  const { data, isError, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      fetch("http://localhost:2000/users").then((res) => res.json()),
  });

  // Mutation for adding a user
  const { mutate: handleAdd } = useMutation({
    mutationFn: (addPosts) =>
      fetch("http://localhost:2000/users", {
        method: "POST",
        body: JSON.stringify(addPosts),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
  });
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div>
      <input
        onChange={(e) => setAllItems({ ...allItems, id: e.target.value })}
        value={allItems.id}
        placeholder="enter id"
      ></input>

      <input
        onChange={(e) => setAllItems({ ...allItems, name: e.target.value })}
        value={allItems.name}
        placeholder="enter name"
      ></input>
      <input
        onChange={(e) => setAllItems({ ...allItems, email: e.target.value })}
        value={allItems.email}
        placeholder="enter email"
      ></input>
      <br></br>
      <button
        className="bg-red-200 p-2 m-2"
        onClick={() => handleAdd(allItems)}
      >
        Add Posts
      </button>
      <button className="bg-red-200 p-2 m-2 ">Edit Posts</button>
      <button className="bg-red-200 p-2 m-2 ">Delete Posts</button>

      {data.map((item) => (
        <div key={item.id}>
          <h1>ID:{item.id}</h1>
          <h1>Name:{item.name}</h1>
          <h1>Email:{item.email}</h1>
        </div>
      ))}
    </div>
  );
};

export default App;
