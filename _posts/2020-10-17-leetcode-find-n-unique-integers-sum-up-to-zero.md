---
layout: post
title:  "Leetcode 1304. Find N Unique Integers Sum up to Zero"
author: Edwin
categories: [ Code ]
tags: [ Leetcode, Python ]
---

This is an interesting problem that actually took me a bit of poking around to fully grasp how to solve. It might not be the most efficient solution, but it'

## Problem

Given an integer n, return any array containing n unique integers such that they add up to 0.

Example 1:
```
Input: n = 5
Output: [-7,-1,1,3,4]
Explanation: These arrays also are accepted [-5,-1,1,2,3] , [-3,-1,2,-2,4].
```

Example 2:
```
Input: n = 3
Output: [-1,0,1]
```

Example 3:
```
Input: n = 1
Output: [0]
```

## Hint

It sounds obvious, but there is no need to go all fancy on this problem. 

Initially, I thought this might be where I bring out hashed datatypes (eg. `Counter`, `dict`) but that's absolutely not necessary.

Recall that the complement of any given integer will produce 0:

```
1 + -1 = 0
```

This is the principle that we'll apply to the solution.

For where n is even, the only values necesary are actually the complements themselves. Example 1 illustrates this somewhat, but it goes all fancy with a bunch of larger numbers. 

A simpler example to illustrate when `n` is even:
```
Input: n = 2
Output: [-1, 1]
```

If n is odd however, there needs to be an extra 0 to meet the number of elements requirement. Example 3 illustrates this.


## Solution

My solution in python:

```python
def sumZero(self, n: int) -> List[int]:
    values = [i for i in range(-(n // 2), (n // 2) + 1)]

    if n % 2 == 0:
        values.pop(n // 2)
        
    return values
```