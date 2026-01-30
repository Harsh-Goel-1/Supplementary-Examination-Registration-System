import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 6))

# Draw entity boxes (text with bounding box)
ax.text(0.1, 0.6, "STUDENT\nstudent_id (PK)\nname\nroll_no",
        bbox=dict(boxstyle="round", fc="lightblue"), ha='center')

ax.text(0.4, 0.8, "COURSE\ncourse_id (PK)\ncourse_name",
        bbox=dict(boxstyle="round", fc="lightgreen"), ha='center')

ax.text(0.7, 0.6, "SUBJECT\nsubject_id (PK)\nsubject_name",
        bbox=dict(boxstyle="round", fc="lightyellow"), ha='center')

ax.text(0.4, 0.4, "REGISTRATION\nreg_id (PK)\nstatus",
        bbox=dict(boxstyle="round", fc="lightcoral"), ha='center')

ax.text(0.4, 0.2, "PAYMENT\npayment_id (PK)\namount",
        bbox=dict(boxstyle="round", fc="lightgray"), ha='center')

# Draw relationship lines
ax.plot([0.4, 0.1], [0.8, 0.6])   # COURSE — STUDENT
ax.plot([0.4, 0.7], [0.8, 0.6])   # COURSE — SUBJECT
ax.plot([0.1, 0.4], [0.6, 0.4])   # STUDENT — REGISTRATION
ax.plot([0.7, 0.4], [0.6, 0.4])   # SUBJECT — REGISTRATION
ax.plot([0.4, 0.4], [0.4, 0.2])   # REGISTRATION — PAYMENT

# Optional relationship labels (nice for viva)
ax.text(0.25, 0.7, "1..*", fontsize=9)
ax.text(0.55, 0.7, "1..*", fontsize=9)
ax.text(0.22, 0.5, "1..*", fontsize=9)
ax.text(0.58, 0.5, "1..*", fontsize=9)
ax.text(0.42, 0.3, "1..1", fontsize=9)

# Remove axes
ax.axis('off')

plt.title("ER Diagram – Supplementary Examination Registration System",
          fontsize=14,y=1.05 )
plt.show()
