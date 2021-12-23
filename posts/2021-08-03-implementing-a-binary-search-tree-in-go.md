---
date: 2021-08-03
title: "Implementing a binary search tree in Go"

metaDescription: meta desc test
metaKeywords: meta, tags, test

summary: "Say you're given an unordered list of numbers - 5, 3, 9, 1, 4, 10 - and asked to check for the existence of the number 4; how do you do it? One way could be to iterate though the list, looking for a match, but that wouldn't be very efficient. A binary search tree is a space and time efficient method of testing for the existence of a given value. In this post, we'll implement a simple example using Go."
---

## What is a Binary Search Tree?

A binary search tree is a rooted tree data structure in which each node contains a value and up to two child nodes - left and right. A node which contains child nodes stores values greater than it's value in the right child, and less than it's value in the left node. If we were to draw the list 5, 3, 9, 1, 4, 10 as a tree, it would look like this:

```
    5
   / \
  3   9
 / \   \
1   4  10
```

In this example, the tree begins with 5. Next in the list is 3, which is less than 5 so we insert a new node to the left of 5. The next value is 9, which is greater than 5, so we insert a new node to the right of 5. The next is 1, which is less than 5, but we already have a node to the left of 5, so we follow the tree, repeating the process, until we find an empty space - and find one under 3, so insert a new node to the left of 3. Next is 4, which is less than 5, but greater than 3, so we add a new node to the right of 3. Lastly, 10 is greater than 5 and greater than 9, so we insert a new node to the right of 9.

To test for the existence of a value, beginning with the root node, we test if the target value is greater than or less than the value of the current node, following the tree until we either have no more nodes to traverse (in which case we know that the tree does not contain our target value) or we find the value.

Using our example, if we want to test for the existence of 4, we would first check if the value of the root node is greater than or less than our target value and move left or right accordingly. Since 4 is less then 5 we move to the left and repeat the test. So in order to locate the target value, the nodes we would visit are 5, 3 and 4.

Inserting into the tree naturally orders the given values, which means searching the tree takes on average around half of the time it would take to linearly search the given unordered list for the target value. The average search time complexity of a binary search tree is O(log n), and the worst case scenario is O(n).

## A Go implementation

In order to implement a binary search tree we'll need a Node type and two methods - `Insert` and `Search`. We'll implement `Node` as a `struct` containing the node value, `v`, and the left (`l`) and right (`r`) child nodes.

```golang
type Node struct {
	v    int
	l, r *Node
}

func New(val int) *Node {
	return &Node{v: val}
}
```

The `Insert` method will traverse the tree, testing and inserting values where necessary. If the `Insert` method encounters its target value it will return as our implementation will skip duplicate values.

```golang
func (n *Node) Insert(val int) {
	switch {
	case val == n.v:
		return // val already exists - skip
	case val < n.v: // val is less than the current node value - move left
		if n.l == nil {
			// if a left node doesn't already exist, insert one and exit
			n.l = New(val)
			return
		}

		// if a left node does exist, repeat the process on that node
		n.l.Insert(val)
	case val > n.v: // val is greater than the current node value - move right
		if n.r == nil {
			// if a right node doesn't already exist, insert one and exit
			n.r = New(val)
			return
		}

		// if a right node does exist, repeat the process on that node
		n.r.Insert(val)
	}
}
```

The `Search` method, similarly to the `Insert` method, recurses though the tree.

```golang
func (n *Node) Search(val int) bool {
	if n == nil {
		// if the current node is nil, there are no more nodes to search and
		// we have not found the target value, so return false
		return false
	}

	switch {
	case val < n.v:
		// val is less than the current node value - move left
		return n.l.Search(val)
	case val > n.v:
		// val is greater than the current node value - move right
		return n.r.Search(val)
	}

	// if we reach this point it means val must be equal to the current node
	// value, therefore we have found a match, so return true
	return true
}
```

We now have the capability to insert and search for values, so lets implement our earlier example.

```golang
func main() {
	// create the root node
	tree := New(5)

	// insert the rest of the values
	tree.Insert(3)
	tree.Insert(9)
	tree.Insert(1)
	tree.Insert(4)
	tree.Insert(10)

	// test for existence
	println(tree.Search(4))
	println(tree.Search(99))
}
```

If we run the example we can see that 4 is indeed present in the list, but 99 is not.

```shell
$ go run main.go
true
false
```
